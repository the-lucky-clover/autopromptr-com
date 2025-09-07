#!/bin/bash
echo "🧪 Testing AutoPromptr System..."

BASE_URL="http://localhost:5000"

# Test 1: Health Check
echo "1️⃣ Testing health check..."
curl -s "$BASE_URL/health" | jq .

echo -e "\n2️⃣ Testing Gemini integration..."
curl -s -X POST "$BASE_URL/api/test/gemini" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Say hello in 5 words"}' | jq .

echo -e "\n3️⃣ Creating test batch..."
BATCH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/batches" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Batch",
    "description": "Testing the system",
    "prompts": [
      {"text": "What is 2+2?", "platform": "gemini"},
      {"text": "Name 3 colors", "platform": "gemini"}
    ]
  }')

echo $BATCH_RESPONSE | jq .
JOB_ID=$(echo $BATCH_RESPONSE | jq -r '.job_id')

if [ "$JOB_ID" != "null" ]; then
    echo -e "\n4️⃣ Running batch job: $JOB_ID"
    curl -s -X POST "$BASE_URL/api/batches/$JOB_ID/run" | jq .
    
    echo -e "\n5️⃣ Checking job status..."
    sleep 2
    curl -s "$BASE_URL/api/batches/$JOB_ID/status" | jq .
else
    echo "❌ Failed to create batch job"
fi

echo -e "\n6️⃣ Listing all batches..."
curl -s "$BASE_URL/api/batches" | jq .