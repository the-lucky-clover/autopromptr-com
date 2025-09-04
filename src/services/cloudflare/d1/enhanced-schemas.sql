-- Enhanced D1 Schema for SMTP, Authentication, and Platform Detection
-- This extends the existing schema with new capabilities

-- Email Queue System
CREATE TABLE IF NOT EXISTS email_queue (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    to_email TEXT NOT NULL,
    from_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_text TEXT,
    body_html TEXT,
    template_id TEXT,
    template_data TEXT, -- JSON string
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'retrying')),
    priority INTEGER DEFAULT 5,
    max_retries INTEGER DEFAULT 3,
    retry_count INTEGER DEFAULT 0,
    scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME,
    error_message TEXT,
    smtp_config_id TEXT,
    user_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SMTP Configuration
CREATE TABLE IF NOT EXISTS smtp_configs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    secure BOOLEAN DEFAULT TRUE,
    username TEXT,
    password TEXT, -- Encrypted
    from_email TEXT NOT NULL,
    from_name TEXT,
    max_connections INTEGER DEFAULT 5,
    rate_limit INTEGER DEFAULT 10, -- emails per minute
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    body_text TEXT,
    body_html TEXT NOT NULL,
    template_variables TEXT, -- JSON array of required variables
    category TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Magic Link Authentication
CREATE TABLE IF NOT EXISTS magic_links (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    token TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    user_id TEXT,
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    ip_address TEXT,
    user_agent TEXT,
    redirect_url TEXT,
    is_used BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced User Sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    refresh_token TEXT UNIQUE,
    device_fingerprint TEXT,
    ip_address TEXT,
    user_agent TEXT,
    device_name TEXT,
    is_trusted_device BOOLEAN DEFAULT FALSE,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Platform Registry for Universal Text-to-Code Support
CREATE TABLE IF NOT EXISTS supported_platforms (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    base_url TEXT NOT NULL,
    platform_type TEXT NOT NULL CHECK (platform_type IN ('web', 'desktop', 'mobile', 'api')),
    category TEXT NOT NULL CHECK (category IN ('ai_assistant', 'code_editor', 'ide', 'playground', 'collaboration')),
    detection_method TEXT NOT NULL CHECK (detection_method IN ('url_match', 'dom_analysis', 'computer_vision', 'api_endpoint')),
    is_active BOOLEAN DEFAULT TRUE,
    confidence_threshold REAL DEFAULT 0.8,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Platform Detection Rules
CREATE TABLE IF NOT EXISTS platform_detection_rules (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    platform_id TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('url_pattern', 'css_selector', 'dom_element', 'text_pattern', 'api_response')),
    rule_value TEXT NOT NULL,
    weight REAL DEFAULT 1.0,
    is_required BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (platform_id) REFERENCES supported_platforms(id)
);

-- Agent Activities and Interactions
CREATE TABLE IF NOT EXISTS agent_activities (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    agent_id TEXT NOT NULL,
    platform_id TEXT,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('detection', 'interaction', 'prompt_submission', 'response_capture', 'error', 'success')),
    batch_id TEXT,
    prompt_id TEXT,
    details TEXT, -- JSON string with activity details
    screenshot_url TEXT,
    confidence_score REAL,
    execution_time_ms INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (platform_id) REFERENCES supported_platforms(id)
);

-- Platform Interactions Log
CREATE TABLE IF NOT EXISTS platform_interactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    platform_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('chat_input', 'button_click', 'form_submit', 'file_upload', 'screenshot', 'wait', 'navigation')),
    element_selector TEXT,
    input_text TEXT,
    response_text TEXT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    execution_time_ms INTEGER,
    screenshot_before TEXT,
    screenshot_after TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (platform_id) REFERENCES supported_platforms(id)
);

-- Two-Factor Authentication
CREATE TABLE IF NOT EXISTS two_factor_auth (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL UNIQUE,
    secret TEXT NOT NULL, -- Encrypted TOTP secret
    backup_codes TEXT, -- JSON array of encrypted backup codes
    is_enabled BOOLEAN DEFAULT FALSE,
    last_used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Platforms
INSERT OR IGNORE INTO supported_platforms (name, display_name, base_url, platform_type, category, detection_method) VALUES
('v0_dev', 'v0.dev', 'https://v0.dev', 'web', 'ai_assistant', 'url_match'),
('lovable', 'Lovable', 'https://lovable.dev', 'web', 'ai_assistant', 'url_match'),
('cursor_web', 'Cursor Web', 'https://cursor.sh', 'web', 'code_editor', 'url_match'),
('windsurf', 'Windsurf', 'https://windsurf.ai', 'web', 'ai_assistant', 'url_match'),
('chatgpt_code', 'ChatGPT Code Interpreter', 'https://chatgpt.com', 'web', 'ai_assistant', 'dom_analysis'),
('claude_artifacts', 'Claude Artifacts', 'https://claude.ai', 'web', 'ai_assistant', 'dom_analysis'),
('replit', 'Replit', 'https://replit.com', 'web', 'ide', 'url_match'),
('codepen', 'CodePen', 'https://codepen.io', 'web', 'playground', 'url_match'),
('gemini_code', 'Gemini Code', 'https://gemini.google.com', 'web', 'ai_assistant', 'dom_analysis'),
('cursor_desktop', 'Cursor Desktop', 'cursor://', 'desktop', 'code_editor', 'computer_vision'),
('vscode_copilot', 'VS Code with Copilot', 'vscode://', 'desktop', 'code_editor', 'computer_vision'),
('jetbrains_ai', 'JetBrains AI Assistant', 'jetbrains://', 'desktop', 'ide', 'computer_vision');

-- Insert Detection Rules for Known Platforms
INSERT OR IGNORE INTO platform_detection_rules (platform_id, rule_type, rule_value, weight, is_required) VALUES
((SELECT id FROM supported_platforms WHERE name = 'v0_dev'), 'url_pattern', '.*v0\\.dev.*', 1.0, TRUE),
((SELECT id FROM supported_platforms WHERE name = 'lovable'), 'url_pattern', '.*lovable\\.(dev|app).*', 1.0, TRUE),
((SELECT id FROM supported_platforms WHERE name = 'chatgpt_code'), 'css_selector', '[data-testid="chat-input"]', 0.8, FALSE),
((SELECT id FROM supported_platforms WHERE name = 'chatgpt_code'), 'text_pattern', 'ChatGPT.*', 0.6, FALSE),
((SELECT id FROM supported_platforms WHERE name = 'claude_artifacts'), 'css_selector', '[data-testid="composer-input"]', 0.8, FALSE),
((SELECT id FROM supported_platforms WHERE name = 'replit'), 'url_pattern', '.*replit\\.com.*', 1.0, TRUE),
((SELECT id FROM supported_platforms WHERE name = 'codepen'), 'url_pattern', '.*codepen\\.io.*', 1.0, TRUE);

-- Insert Default Email Templates
INSERT OR IGNORE INTO email_templates (name, subject, body_html, template_variables) VALUES
('magic_link', 'Sign in to AutoPromptr', 
'<h1>Sign in to AutoPromptr</h1>
<p>Click the link below to sign in:</p>
<a href="{{magic_link}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Sign In</a>
<p>This link expires in {{expires_in}} minutes.</p>
<p>If you did not request this, please ignore this email.</p>',
'["magic_link", "expires_in"]'),

('batch_completed', 'Batch Processing Complete', 
'<h1>Batch "{{batch_name}}" Completed</h1>
<p>Your batch processing has finished successfully.</p>
<ul>
<li>Total prompts: {{total_prompts}}</li>
<li>Successful: {{successful_prompts}}</li>
<li>Failed: {{failed_prompts}}</li>
</ul>
<p><a href="{{dashboard_url}}">View Results</a></p>',
'["batch_name", "total_prompts", "successful_prompts", "failed_prompts", "dashboard_url"]');

-- Insert Default SMTP Config (placeholder)
INSERT OR IGNORE INTO smtp_configs (name, host, port, secure, from_email, from_name, is_default) VALUES
('Default SMTP', 'smtp.gmail.com', 587, TRUE, 'noreply@autopromptr.com', 'AutoPromptr', TRUE);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);
CREATE INDEX IF NOT EXISTS idx_magic_links_email ON magic_links(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_detection_platform ON platform_detection_rules(platform_id);
CREATE INDEX IF NOT EXISTS idx_agent_activities_agent ON agent_activities(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_activities_platform ON agent_activities(platform_id);
CREATE INDEX IF NOT EXISTS idx_platform_interactions_platform ON platform_interactions(platform_id);