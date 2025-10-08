"""
Automation endpoints for smart prompt injection
MVP #1 Implementation
"""
from flask import Blueprint, request, jsonify
import asyncio
import logging
from services.batch_processor_service import batch_processor_service
from services.playwright_service import playwright_service

logger = logging.getLogger(__name__)

automation_bp = Blueprint('automation', __name__, url_prefix='/api/automation')


@automation_bp.route('/process-batch', methods=['POST'])
def process_batch():
    """
    Process a batch of prompts with smart waiting
    
    Body:
        {
            "batch_id": "unique-batch-id",
            "target_url": "https://lovable.dev",
            "prompts": [
                {"id": "p1", "text": "Create a button"},
                {"id": "p2", "text": "Add a form"}
            ],
            "options": {
                "wait_for_completion": true,
                "max_retries": 3
            }
        }
    """
    try:
        data = request.get_json()
        
        batch_id = data.get('batch_id')
        target_url = data.get('target_url')
        prompts = data.get('prompts', [])
        options = data.get('options', {})
        
        if not batch_id or not target_url or not prompts:
            return jsonify({
                'error': 'batch_id, target_url, and prompts are required'
            }), 400
        
        # Start batch processing asynchronously
        result = asyncio.run(
            batch_processor_service.process_batch(
                batch_id=batch_id,
                target_url=target_url,
                prompts=prompts,
                options=options
            )
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Batch processing error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@automation_bp.route('/batch-status/<batch_id>', methods=['GET'])
def get_batch_status(batch_id: str):
    """Get current status of a batch"""
    try:
        status = batch_processor_service.get_batch_status(batch_id)
        
        if not status:
            return jsonify({'error': 'Batch not found'}), 404
        
        return jsonify(status)
        
    except Exception as e:
        logger.error(f"Error getting batch status: {str(e)}")
        return jsonify({'error': str(e)}), 500


@automation_bp.route('/stop-batch/<batch_id>', methods=['POST'])
def stop_batch(batch_id: str):
    """Stop a running batch"""
    try:
        success = asyncio.run(batch_processor_service.stop_batch(batch_id))
        
        if success:
            return jsonify({
                'message': f'Batch {batch_id} stopped',
                'batch_id': batch_id
            })
        else:
            return jsonify({'error': 'Batch not found'}), 404
        
    except Exception as e:
        logger.error(f"Error stopping batch: {str(e)}")
        return jsonify({'error': str(e)}), 500


@automation_bp.route('/test-automation', methods=['POST'])
def test_automation():
    """Test automation with a single prompt"""
    try:
        data = request.get_json()
        
        target_url = data.get('target_url', 'https://lovable.dev')
        prompt = data.get('prompt', 'Test prompt')
        wait_for_completion = data.get('wait_for_completion', True)
        
        result = asyncio.run(
            playwright_service.navigate_and_submit(
                url=target_url,
                prompt=prompt,
                wait_for_completion=wait_for_completion
            )
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Test automation error: {str(e)}")
        return jsonify({'error': str(e)}), 500
