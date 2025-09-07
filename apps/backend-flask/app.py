#!/usr/bin/env python3
"""
Main Flask application for the AutoPromptr backend service.
Provides REST API endpoints for batch job management and AI orchestration.
"""

import os
import asyncio
from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import Dict, Any, List
import logging
from datetime import datetime

from services.gemini_service import GeminiService, GeminiConfig
from services.enhanced_orchestrator_service import EnhancedAIOrchestrator
from services.human_approval_service import human_approval_service
from services.universal_batch_service import UniversalBatchService, BatchRequest
from websocket_service import websocket_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["*"])  # Allow all origins for development

# Initialize services
gemini_config = GeminiConfig(
    api_key=os.getenv('GEMINI_API_KEY', ''),
    model="gemini-1.5-flash",
    temperature=0.7,
    max_tokens=1000
)

# Global orchestrator and batch service instances
orchestrator = None
universal_batch_service = None

def get_orchestrator():
    """Get or create the global orchestrator instance"""
    global orchestrator
    if orchestrator is None:
        if not gemini_config.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        orchestrator = EnhancedAIOrchestrator(gemini_config)
        
        # Register WebSocket callback for real-time updates
        async def websocket_callback(message):
            await websocket_service.broadcast_to_channel('orchestrator', message)
        
        orchestrator.register_websocket_callback(websocket_callback)
    return orchestrator

def get_universal_batch_service():
    """Get or create the global universal batch service instance"""
    global universal_batch_service
    if universal_batch_service is None:
        universal_batch_service = UniversalBatchService()
        asyncio.run(universal_batch_service.initialize())
    return universal_batch_service

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        orch = get_orchestrator()
        health_status = asyncio.run(orch.health_check())
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'service': 'autopromptr-backend',
            'version': '1.0.0',
            'services': health_status
        })
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/batches', methods=['POST'])
def create_batch():
    """Create a new batch job"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        name = data.get('name')
        description = data.get('description', '')
        prompts = data.get('prompts', [])
        
        if not name:
            return jsonify({'error': 'Batch name is required'}), 400
        
        if not prompts:
            return jsonify({'error': 'At least one prompt is required'}), 400
        
        # Validate prompts format
        for i, prompt in enumerate(prompts):
            if not isinstance(prompt, dict) or 'text' not in prompt:
                return jsonify({
                    'error': f'Invalid prompt format at index {i}. Expected {{text: string, platform?: string}}'
                }), 400
        
        orch = get_orchestrator()
        batch_job = orch.create_batch_job(name, description, prompts)
        
        return jsonify({
            'job_id': batch_job.job_id,
            'status': batch_job.status,
            'message': f'Batch job "{name}" created successfully'
        })
        
    except Exception as e:
        logger.error(f"Error creating batch: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/batches/<job_id>/run', methods=['POST'])
def run_batch(job_id: str):
    """Start execution of a batch job"""
    try:
        orch = get_orchestrator()
        result = asyncio.run(orch.run_batch_job(job_id))
        
        return jsonify({
            'message': f'Batch job {job_id} execution started',
            'job_id': job_id,
            'status': result.get('status', 'running')
        })
        
    except Exception as e:
        logger.error(f"Error running batch {job_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/batches/<job_id>/status', methods=['GET'])
def get_batch_status(job_id: str):
    """Get the status of a batch job"""
    try:
        orch = get_orchestrator()
        status_data = orch.get_job_status(job_id)
        
        return jsonify(status_data)
        
    except Exception as e:
        logger.error(f"Error getting status for batch {job_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/batches/<job_id>/stop', methods=['POST'])
def stop_batch(job_id: str):
    """Stop execution of a batch job"""
    try:
        orch = get_orchestrator()
        result = orch.stop_job(job_id)
        
        return jsonify({
            'status': 'stopped',
            'job_id': job_id,
            'message': result.get('message', 'Job stopped successfully')
        })
        
    except Exception as e:
        logger.error(f"Error stopping batch {job_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/run-batch', methods=['POST'])
async def run_batch_combined():
    """Create and run a batch job in one call (for frontend compatibility)"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        batch_data = data.get('batch', {})
        platform = data.get('platform', 'web')
        
        # Extract batch information
        name = batch_data.get('name', f'Batch-{datetime.now().strftime("%Y%m%d-%H%M%S")}')
        description = batch_data.get('description', '')
        
        # Convert frontend prompts format to backend format
        prompts = []
        for prompt_data in batch_data.get('prompts', []):
            prompts.append({
                'text': prompt_data.get('text', ''),
                'platform': platform
            })
        
        if not prompts:
            return jsonify({'error': 'At least one prompt is required'}), 400
        
        orch = get_orchestrator()
        
        # Enhanced batch creation with human oversight options
        options = data.get('options', {})
        
        # Create batch request for universal service
        batch_request = BatchRequest(
            batch_id=f'batch-{datetime.now().strftime("%Y%m%d-%H%M%S")}-{hash(name) % 10000}',
            batch_name=name,
            target_url=batch_data.get('targetUrl', 'https://chat.openai.com'),
            prompts=prompts,
            platform_type=platform,
            automation_mode=options.get('automation_mode', 'hybrid'),
            confidence_threshold=options.get('auto_approval_threshold', 0.8),
            options=options
        )
        
        # Use universal batch service
        universal_service = get_universal_batch_service()
        result = await universal_service.start_batch(batch_request)
        
        return jsonify({
            'job_id': batch_request.batch_id,
            'status': 'started' if result.get('success') else 'failed',
            'message': result.get('message', 'Batch processing started'),
            'batch_id': batch_request.batch_id
        })
        
    except Exception as e:
        logger.error(f"Error creating and running batch: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/batches', methods=['GET'])
def list_batches():
    """List all batch jobs"""
    try:
        orch = get_orchestrator()
        jobs_data = orch.list_jobs()
        
        return jsonify(jobs_data)
        
    except Exception as e:
        logger.error(f"Error listing batches: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/test/gemini', methods=['POST'])
def test_gemini():
    """Test Gemini API integration"""
    try:
        data = request.get_json() or {}
        prompt = data.get('prompt', 'Hello, this is a test prompt.')
        
        if not gemini_config.api_key:
            return jsonify({
                'success': False,
                'error': 'GEMINI_API_KEY not configured'
            }), 500
        
        gemini_service = GeminiService(gemini_config)
        result = asyncio.run(gemini_service.process_prompt(prompt))
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error testing Gemini: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/jobs/<job_id>/tasks', methods=['GET'])
def get_job_tasks(job_id: str):
    """Get detailed task information for a job"""
    try:
        orch = get_orchestrator()
        job = orch.jobs.get(job_id)
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        tasks_data = []
        for task in job.tasks:
            tasks_data.append({
                'task_id': task.task_id,
                'prompt': task.prompt,
                'platform': task.platform,
                'status': task.status,
                'created_at': task.created_at.isoformat() if task.created_at else None,
                'completed_at': task.completed_at.isoformat() if task.completed_at else None,
                'result': task.result,
                'error': task.error
            })
        
        return jsonify({
            'job_id': job_id,
            'tasks': tasks_data
        })
        
    except Exception as e:
        logger.error(f"Error getting tasks for job {job_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Universal Batch Service Endpoints

@app.route('/api/universal/detect-platform', methods=['POST'])
def detect_platform():
    """Detect platform type and capabilities"""
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        universal_service = get_universal_batch_service()
        result = asyncio.run(universal_service.detect_platform(url))
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Platform detection failed: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/universal/batch/<batch_id>/pause', methods=['POST'])
def pause_universal_batch(batch_id: str):
    """Pause an active universal batch"""
    try:
        universal_service = get_universal_batch_service()
        result = asyncio.run(universal_service.pause_batch(batch_id))
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Failed to pause batch {batch_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/universal/batch/<batch_id>/resume', methods=['POST'])
def resume_universal_batch(batch_id: str):
    """Resume a paused universal batch"""
    try:
        universal_service = get_universal_batch_service()
        result = asyncio.run(universal_service.resume_batch(batch_id))
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Failed to resume batch {batch_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/universal/batch/<batch_id>/cancel', methods=['POST'])
def cancel_universal_batch(batch_id: str):
    """Cancel an active universal batch"""
    try:
        universal_service = get_universal_batch_service()
        result = asyncio.run(universal_service.cancel_batch(batch_id))
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Failed to cancel batch {batch_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/universal/batch/<batch_id>/status', methods=['GET'])
def get_universal_batch_status(batch_id: str):
    """Get status of a universal batch"""
    try:
        universal_service = get_universal_batch_service()
        status = universal_service.get_batch_status(batch_id)
        
        if not status:
            return jsonify({'error': 'Batch not found'}), 404
        
        return jsonify({
            'batch_id': status.batch_id,
            'status': status.status,
            'current_prompt': status.current_prompt,
            'total_prompts': status.total_prompts,
            'completed_prompts': status.completed_prompts,
            'failed_prompts': status.failed_prompts,
            'progress_percentage': status.progress_percentage,
            'current_action': status.current_action,
            'last_updated': status.last_updated
        })
        
    except Exception as e:
        logger.error(f"Failed to get batch status {batch_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/universal/batches', methods=['GET'])
def list_universal_batches():
    """List all universal batches"""
    try:
        universal_service = get_universal_batch_service()
        batches = universal_service.get_all_batches()
        
        batch_list = []
        for batch_id, status in batches.items():
            batch_list.append({
                'batch_id': status.batch_id,
                'status': status.status,
                'progress_percentage': status.progress_percentage,
                'current_action': status.current_action,
                'last_updated': status.last_updated
            })
        
        return jsonify({'batches': batch_list})
        
    except Exception as e:
        logger.error(f"Failed to list universal batches: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting AutoPromptr backend on port {port}")
    logger.info(f"Debug mode: {debug}")
    
    if not os.getenv('GEMINI_API_KEY'):
        logger.warning("GEMINI_API_KEY not set - some functionality may be limited")
    
    app.run(host='0.0.0.0', port=port, debug=debug)