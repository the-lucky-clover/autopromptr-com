"""
Human approval service for AI agent orchestration
"""
import asyncio
import json
import uuid
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class ApprovalStatus(Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    TIMEOUT = "timeout"

class ConfidenceLevel(Enum):
    LOW = "low"          # Confidence < 0.3 - Always require approval
    MEDIUM = "medium"    # Confidence 0.3-0.7 - Require approval for critical actions
    HIGH = "high"        # Confidence > 0.7 - Auto-proceed unless user overrides

@dataclass
class ApprovalRequest:
    id: str
    task_id: str
    agent_id: str
    action_type: str
    description: str
    context: Dict[str, Any]
    confidence: float
    confidence_level: ConfidenceLevel
    status: ApprovalStatus = ApprovalStatus.PENDING
    auto_approve_threshold: float = 0.8
    timeout_seconds: int = 300  # 5 minutes
    created_at: str = None
    responded_at: Optional[str] = None
    response_data: Optional[Dict] = None
    screenshot_b64: Optional[str] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow().isoformat()

@dataclass
class HumanDecision:
    approval_id: str
    decision: ApprovalStatus
    reasoning: str
    modifications: Optional[Dict] = None
    timestamp: str = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow().isoformat()

class HumanApprovalService:
    def __init__(self):
        self.pending_approvals: Dict[str, ApprovalRequest] = {}
        self.approval_history: List[ApprovalRequest] = []
        self.websocket_callbacks: List[Callable] = []
        self.auto_approval_settings = {
            'enabled': True,
            'high_confidence_threshold': 0.8,
            'medium_confidence_actions': ['navigate', 'extract'],  # Actions that need approval even with medium confidence
            'always_approve_actions': [],  # Actions that auto-approve regardless
            'never_approve_actions': ['delete', 'purchase', 'submit_form']  # Actions that always need approval
        }
    
    def register_websocket_callback(self, callback: Callable):
        """Register callback for WebSocket notifications"""
        self.websocket_callbacks.append(callback)
    
    async def request_approval(
        self,
        task_id: str,
        agent_id: str,
        action_type: str,
        description: str,
        context: Dict[str, Any],
        confidence: float,
        screenshot_b64: Optional[str] = None
    ) -> ApprovalRequest:
        """Request human approval for an agent action"""
        
        request_id = str(uuid.uuid4())
        confidence_level = self._determine_confidence_level(confidence)
        
        approval_request = ApprovalRequest(
            id=request_id,
            task_id=task_id,
            agent_id=agent_id,
            action_type=action_type,
            description=description,
            context=context,
            confidence=confidence,
            confidence_level=confidence_level,
            screenshot_b64=screenshot_b64
        )
        
        # Check if auto-approval applies
        if self._should_auto_approve(approval_request):
            approval_request.status = ApprovalStatus.APPROVED
            approval_request.responded_at = datetime.utcnow().isoformat()
            approval_request.response_data = {
                'auto_approved': True,
                'reason': f'High confidence ({confidence:.2f}) and auto-approval enabled'
            }
            
            logger.info(f"Auto-approved action {action_type} for task {task_id} with confidence {confidence:.2f}")
            
            # Still notify observers but don't wait
            await self._notify_websockets('auto_approval', approval_request)
            self.approval_history.append(approval_request)
            
            return approval_request
        
        # Store for human review
        self.pending_approvals[request_id] = approval_request
        
        # Notify via WebSocket
        await self._notify_websockets('approval_request', approval_request)
        
        logger.info(f"Approval requested for action {action_type} on task {task_id} (confidence: {confidence:.2f})")
        
        return approval_request
    
    async def respond_to_approval(
        self,
        approval_id: str,
        decision: ApprovalStatus,
        reasoning: str = "",
        modifications: Optional[Dict] = None
    ) -> bool:
        """Human response to approval request"""
        
        if approval_id not in self.pending_approvals:
            logger.error(f"Approval request {approval_id} not found")
            return False
        
        approval_request = self.pending_approvals[approval_id]
        approval_request.status = decision
        approval_request.responded_at = datetime.utcnow().isoformat()
        approval_request.response_data = {
            'reasoning': reasoning,
            'modifications': modifications,
            'human_decision': True
        }
        
        # Move to history
        self.approval_history.append(approval_request)
        del self.pending_approvals[approval_id]
        
        # Notify via WebSocket
        await self._notify_websockets('approval_response', approval_request)
        
        logger.info(f"Approval {approval_id} {decision.value} by human: {reasoning}")
        
        return True
    
    async def wait_for_approval(self, approval_id: str, timeout_seconds: int = 300) -> ApprovalRequest:
        """Wait for approval response with timeout"""
        
        start_time = datetime.utcnow()
        timeout_time = start_time + timedelta(seconds=timeout_seconds)
        
        while datetime.utcnow() < timeout_time:
            # Check if approval is still pending
            if approval_id not in self.pending_approvals:
                # Look in history
                for approval in self.approval_history:
                    if approval.id == approval_id:
                        return approval
                
                # Not found anywhere
                raise ValueError(f"Approval request {approval_id} not found")
            
            # Still pending, wait a bit
            await asyncio.sleep(1)
        
        # Timeout reached
        approval_request = self.pending_approvals[approval_id]
        approval_request.status = ApprovalStatus.TIMEOUT
        approval_request.responded_at = datetime.utcnow().isoformat()
        approval_request.response_data = {
            'timeout': True,
            'timeout_seconds': timeout_seconds
        }
        
        # Move to history
        self.approval_history.append(approval_request)
        del self.pending_approvals[approval_id]
        
        # Notify timeout
        await self._notify_websockets('approval_timeout', approval_request)
        
        logger.warning(f"Approval request {approval_id} timed out after {timeout_seconds} seconds")
        
        return approval_request
    
    def get_pending_approvals(self) -> List[ApprovalRequest]:
        """Get all pending approval requests"""
        return list(self.pending_approvals.values())
    
    def get_approval_history(self, limit: int = 50) -> List[ApprovalRequest]:
        """Get approval history"""
        return self.approval_history[-limit:]
    
    def get_approval_stats(self) -> Dict[str, Any]:
        """Get approval statistics"""
        total_requests = len(self.approval_history) + len(self.pending_approvals)
        
        if total_requests == 0:
            return {
                'total_requests': 0,
                'approval_rate': 0,
                'average_response_time': 0,
                'auto_approval_rate': 0
            }
        
        approved = len([a for a in self.approval_history if a.status == ApprovalStatus.APPROVED])
        auto_approved = len([a for a in self.approval_history if a.response_data and a.response_data.get('auto_approved')])
        
        # Calculate average response time for human decisions
        human_decisions = [a for a in self.approval_history 
                          if a.responded_at and not (a.response_data and a.response_data.get('auto_approved'))]
        
        avg_response_time = 0
        if human_decisions:
            response_times = []
            for approval in human_decisions:
                created = datetime.fromisoformat(approval.created_at)
                responded = datetime.fromisoformat(approval.responded_at)
                response_times.append((responded - created).total_seconds())
            avg_response_time = sum(response_times) / len(response_times)
        
        return {
            'total_requests': total_requests,
            'pending_requests': len(self.pending_approvals),
            'approval_rate': (approved / len(self.approval_history)) * 100 if self.approval_history else 0,
            'auto_approval_rate': (auto_approved / len(self.approval_history)) * 100 if self.approval_history else 0,
            'average_response_time_seconds': avg_response_time,
            'timeout_rate': len([a for a in self.approval_history if a.status == ApprovalStatus.TIMEOUT]) / len(self.approval_history) * 100 if self.approval_history else 0
        }
    
    def update_auto_approval_settings(self, settings: Dict[str, Any]):
        """Update auto-approval settings"""
        self.auto_approval_settings.update(settings)
        logger.info(f"Updated auto-approval settings: {self.auto_approval_settings}")
    
    def _determine_confidence_level(self, confidence: float) -> ConfidenceLevel:
        """Determine confidence level from confidence score"""
        if confidence < 0.3:
            return ConfidenceLevel.LOW
        elif confidence < 0.7:
            return ConfidenceLevel.MEDIUM
        else:
            return ConfidenceLevel.HIGH
    
    def _should_auto_approve(self, approval_request: ApprovalRequest) -> bool:
        """Determine if request should be auto-approved"""
        settings = self.auto_approval_settings
        
        if not settings['enabled']:
            return False
        
        # Never auto-approve certain actions
        if approval_request.action_type in settings['never_approve_actions']:
            return False
        
        # Always auto-approve certain actions
        if approval_request.action_type in settings['always_approve_actions']:
            return True
        
        # High confidence actions
        if (approval_request.confidence >= settings['high_confidence_threshold'] and 
            approval_request.action_type not in settings['medium_confidence_actions']):
            return True
        
        return False
    
    async def _notify_websockets(self, event_type: str, approval_request: ApprovalRequest):
        """Notify WebSocket clients about approval events"""
        message = {
            'type': event_type,
            'data': asdict(approval_request),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Call all registered WebSocket callbacks
        for callback in self.websocket_callbacks:
            try:
                await callback(message)
            except Exception as e:
                logger.error(f"WebSocket callback failed: {str(e)}")

# Global service instance
human_approval_service = HumanApprovalService()