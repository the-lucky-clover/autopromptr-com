// src/api/index.js

const BASE_URL = 'https://autopromptr-backend.onrender.com/api';

async function startBatchProcessing(batchId) {
  const response = await fetch(`${BASE_URL}/queue/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ batchId })
  });
  if (!response.ok) {
    throw new Error('Failed to start batch processing');
  }
  return response.json();
}

async function getQueueStatus() {
  const response = await fetch(`${BASE_URL}/queue/status`);
  if (!response.ok) {
    throw new Error('Failed to get queue status');
  }
  return response.json();
}

async function submitPrompt(prompt, config) {
  const response = await fetch(`${BASE_URL}/agent/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt, config })
  });
  if (!response.ok) {
    throw new Error('Failed to submit prompt');
  }
  return response.json();
}

export {
  startBatchProcessing,
  getQueueStatus,
  submitPrompt
};
