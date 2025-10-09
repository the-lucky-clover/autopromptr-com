"""
Comprehensive input validation for Flask backend
Prevents prompt injection, XSS, and other injection attacks
"""
import re
import html
from typing import Dict, List, Tuple, Any
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)

# Dangerous patterns that could indicate injection attacks
DANGEROUS_PATTERNS = [
    (r'import\s+os', 'OS module import'),
    (r'import\s+subprocess', 'Subprocess import'),
    (r'eval\s*\(', 'Eval function'),
    (r'exec\s*\(', 'Exec function'),
    (r'__import__', 'Dynamic import'),
    (r'<script[^>]*>', 'Script tag'),
    (r'javascript:', 'JavaScript protocol'),
    (r'onerror\s*=', 'Onerror handler'),
    (r'onclick\s*=', 'Onclick handler'),
    (r'onload\s*=', 'Onload handler'),
    (r'<iframe', 'Iframe tag'),
    (r'document\.cookie', 'Cookie access'),
    (r'localStorage', 'LocalStorage access'),
    (r'sessionStorage', 'SessionStorage access'),
    (r'XMLHttpRequest', 'XMLHttpRequest'),
    (r'fetch\s*\(', 'Fetch API'),
    (r'\.system\s*\(', 'System call'),
    (r'rm\s+-rf', 'Dangerous shell command'),
    (r'DROP\s+TABLE', 'SQL drop command'),
    (r'DELETE\s+FROM', 'SQL delete command'),
    (r'UPDATE\s+.*\s+SET', 'SQL update command'),
]

# Maximum lengths for different input types
MAX_BATCH_NAME_LENGTH = 200
MAX_PROMPT_LENGTH = 5000
MAX_DESCRIPTION_LENGTH = 1000
MAX_URL_LENGTH = 2048
MAX_PROMPTS_PER_BATCH = 100

# Allowed URL schemes
ALLOWED_URL_SCHEMES = ['http', 'https']

# Allowed domains (whitelist for target URLs)
ALLOWED_DOMAINS = [
    'lovable.dev',
    'chatgpt.com',
    'claude.ai',
    'gemini.google.com',
    'copilot.microsoft.com',
]

class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass

class InputValidator:
    """Comprehensive input validation for batch processing"""
    
    @staticmethod
    def validate_batch_data(data: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Validate complete batch data structure
        
        Args:
            data: Dictionary containing batch data
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            # Check required fields
            if 'batch' not in data:
                return False, "Missing 'batch' field in request"
            
            batch = data['batch']
            
            # Validate batch structure
            if not isinstance(batch, dict):
                return False, "Batch must be a dictionary"
            
            # Validate prompts array
            if 'prompts' not in batch:
                return False, "Missing 'prompts' field in batch"
            
            if not isinstance(batch['prompts'], list):
                return False, "Prompts must be an array"
            
            if len(batch['prompts']) == 0:
                return False, "Batch must contain at least one prompt"
            
            if len(batch['prompts']) > MAX_PROMPTS_PER_BATCH:
                return False, f"Batch cannot contain more than {MAX_PROMPTS_PER_BATCH} prompts"
            
            # Validate each prompt
            for i, prompt in enumerate(batch['prompts']):
                is_valid, error = InputValidator.validate_prompt(prompt, i)
                if not is_valid:
                    return False, error
            
            # Validate optional fields
            if 'name' in batch:
                is_valid, error = InputValidator.validate_batch_name(batch['name'])
                if not is_valid:
                    return False, error
            
            if 'description' in batch:
                is_valid, error = InputValidator.validate_description(batch['description'])
                if not is_valid:
                    return False, error
            
            if 'targetUrlOverride' in batch:
                is_valid, error = InputValidator.validate_url(batch['targetUrlOverride'])
                if not is_valid:
                    return False, error
            
            return True, ""
            
        except Exception as e:
            logger.error(f"Validation error: {str(e)}")
            return False, f"Validation error: {str(e)}"
    
    @staticmethod
    def validate_prompt(prompt: Dict[str, Any], index: int) -> Tuple[bool, str]:
        """
        Validate individual prompt data
        
        Args:
            prompt: Prompt dictionary
            index: Index of prompt in batch
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check prompt structure
        if not isinstance(prompt, dict):
            return False, f"Prompt {index} must be a dictionary"
        
        # Check for prompt_text field
        if 'prompt_text' not in prompt and 'text' not in prompt:
            return False, f"Prompt {index} missing 'prompt_text' or 'text' field"
        
        # Get prompt text (handle both field names)
        prompt_text = prompt.get('prompt_text') or prompt.get('text')
        
        if not prompt_text:
            return False, f"Prompt {index} text cannot be empty"
        
        if not isinstance(prompt_text, str):
            return False, f"Prompt {index} text must be a string"
        
        # Check length
        if len(prompt_text) > MAX_PROMPT_LENGTH:
            return False, f"Prompt {index} exceeds maximum length of {MAX_PROMPT_LENGTH} characters"
        
        # Check for dangerous patterns
        for pattern, description in DANGEROUS_PATTERNS:
            if re.search(pattern, prompt_text, re.IGNORECASE | re.MULTILINE):
                logger.warning(f"Dangerous pattern detected in prompt {index}: {description}")
                return False, f"Prompt {index} contains dangerous pattern: {description}"
        
        return True, ""
    
    @staticmethod
    def validate_batch_name(name: str) -> Tuple[bool, str]:
        """Validate batch name"""
        if not name or not isinstance(name, str):
            return False, "Batch name must be a non-empty string"
        
        if len(name) > MAX_BATCH_NAME_LENGTH:
            return False, f"Batch name exceeds maximum length of {MAX_BATCH_NAME_LENGTH}"
        
        # Remove potentially dangerous characters
        if re.search(r'[<>"\']', name):
            return False, "Batch name contains invalid characters"
        
        return True, ""
    
    @staticmethod
    def validate_description(description: str) -> Tuple[bool, str]:
        """Validate batch description"""
        if not isinstance(description, str):
            return False, "Description must be a string"
        
        if len(description) > MAX_DESCRIPTION_LENGTH:
            return False, f"Description exceeds maximum length of {MAX_DESCRIPTION_LENGTH}"
        
        return True, ""
    
    @staticmethod
    def validate_url(url: str) -> Tuple[bool, str]:
        """
        Validate target URL for automation
        Implements strict whitelist-based validation
        """
        if not url or not isinstance(url, str):
            return False, "URL must be a non-empty string"
        
        if len(url) > MAX_URL_LENGTH:
            return False, f"URL exceeds maximum length of {MAX_URL_LENGTH}"
        
        try:
            parsed = urlparse(url)
            
            # Check scheme
            if parsed.scheme not in ALLOWED_URL_SCHEMES:
                return False, f"URL scheme must be one of: {', '.join(ALLOWED_URL_SCHEMES)}"
            
            # Check domain whitelist
            domain = parsed.netloc.lower()
            
            # Remove port if present
            if ':' in domain:
                domain = domain.split(':')[0]
            
            # Check against whitelist
            is_allowed = any(
                domain == allowed_domain or domain.endswith('.' + allowed_domain)
                for allowed_domain in ALLOWED_DOMAINS
            )
            
            if not is_allowed:
                return False, f"Domain not in whitelist. Allowed domains: {', '.join(ALLOWED_DOMAINS)}"
            
            # Check for private/local IPs (SSRF protection)
            if any(pattern in domain for pattern in ['localhost', '127.0.0.1', '0.0.0.0', '::1', '10.', '172.', '192.168.']):
                return False, "Private/local URLs are not allowed"
            
            return True, ""
            
        except Exception as e:
            return False, f"Invalid URL format: {str(e)}"
    
    @staticmethod
    def sanitize_prompt_text(text: str) -> str:
        """
        Sanitize prompt text to remove dangerous content
        
        Args:
            text: Raw prompt text
            
        Returns:
            Sanitized text
        """
        # Escape HTML entities
        sanitized = html.escape(text)
        
        # Remove null bytes
        sanitized = sanitized.replace('\x00', '')
        
        # Normalize whitespace but preserve newlines
        sanitized = re.sub(r'[ \t]+', ' ', sanitized)
        
        # Trim to max length
        if len(sanitized) > MAX_PROMPT_LENGTH:
            sanitized = sanitized[:MAX_PROMPT_LENGTH]
        
        return sanitized.strip()
    
    @staticmethod
    def sanitize_batch_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sanitize all text fields in batch data
        
        Args:
            data: Raw batch data
            
        Returns:
            Sanitized batch data
        """
        if 'batch' not in data:
            return data
        
        batch = data['batch']
        
        # Sanitize prompts
        if 'prompts' in batch and isinstance(batch['prompts'], list):
            for prompt in batch['prompts']:
                if 'prompt_text' in prompt:
                    prompt['prompt_text'] = InputValidator.sanitize_prompt_text(prompt['prompt_text'])
                if 'text' in prompt:
                    prompt['text'] = InputValidator.sanitize_prompt_text(prompt['text'])
        
        # Sanitize optional fields
        if 'name' in batch:
            batch['name'] = html.escape(str(batch['name']))[:MAX_BATCH_NAME_LENGTH]
        
        if 'description' in batch:
            batch['description'] = html.escape(str(batch['description']))[:MAX_DESCRIPTION_LENGTH]
        
        return data
    
    @staticmethod
    def validate_automation_request(data: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Validate automation endpoint request
        
        Args:
            data: Request data
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Validate target_url
        if 'target_url' in data:
            is_valid, error = InputValidator.validate_url(data['target_url'])
            if not is_valid:
                return False, error
        
        # Validate prompt
        if 'prompt' in data:
            if not isinstance(data['prompt'], str):
                return False, "Prompt must be a string"
            
            if len(data['prompt']) > MAX_PROMPT_LENGTH:
                return False, f"Prompt exceeds maximum length of {MAX_PROMPT_LENGTH}"
            
            # Check for dangerous patterns
            for pattern, description in DANGEROUS_PATTERNS:
                if re.search(pattern, data['prompt'], re.IGNORECASE):
                    return False, f"Prompt contains dangerous pattern: {description}"
        
        # Validate prompts array
        if 'prompts' in data:
            if not isinstance(data['prompts'], list):
                return False, "Prompts must be an array"
            
            if len(data['prompts']) > MAX_PROMPTS_PER_BATCH:
                return False, f"Cannot process more than {MAX_PROMPTS_PER_BATCH} prompts"
            
            for i, prompt_item in enumerate(data['prompts']):
                if isinstance(prompt_item, dict):
                    prompt_text = prompt_item.get('text', '')
                else:
                    prompt_text = str(prompt_item)
                
                if len(prompt_text) > MAX_PROMPT_LENGTH:
                    return False, f"Prompt {i} exceeds maximum length"
                
                # Check for dangerous patterns
                for pattern, description in DANGEROUS_PATTERNS:
                    if re.search(pattern, prompt_text, re.IGNORECASE):
                        return False, f"Prompt {i} contains dangerous pattern: {description}"
        
        return True, ""
