CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  failed_login_count INT NOT NULL DEFAULT 0,
  lock_until DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  replaced_by_hash CHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  ip VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token_hash (token_hash),
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NULL,
  ip VARCHAR(45) NULL,
  success TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_time (email, created_at),
  INDEX idx_ip_time (ip, created_at)
) ENGINE=InnoDB;



CREATE TABLE IF NOT EXISTS campaigns (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(190) NOT NULL,      
  source VARCHAR(190) NULL,         
  is_archived TINYINT(1) NOT NULL DEFAULT 0,
  last_used_at DATETIME NULL,      
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_campaign_user (user_id),
  INDEX idx_campaign_user_created (user_id, created_at DESC),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS refusal_reasons (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NOT NULL,
  label VARCHAR(190) NOT NULL,      
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_refusal_campaign (campaign_id),

  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS prospects (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NOT NULL,

  company VARCHAR(190) NULL,
  name VARCHAR(190) NULL,
  phone VARCHAR(32) NOT NULL,
  email VARCHAR(190) NULL,
  notes TEXT NULL,

  status VARCHAR(32) NOT NULL DEFAULT 'open',

  last_call_result VARCHAR(32) NULL,
  last_call_at DATETIME NULL,
  last_call_duration_sec INT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_prospect_campaign (campaign_id),
  INDEX idx_prospect_phone (phone),
  INDEX idx_prospect_campaign_result (campaign_id, last_call_result),
  INDEX idx_prospect_campaign_status (campaign_id, status, created_at),

  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS call_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NOT NULL,
  prospect_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,

  started_at DATETIME NOT NULL,
  ended_at DATETIME NULL,
  duration_sec INT NULL,

  result VARCHAR(32) NOT NULL,           
  refusal_reason_id BIGINT UNSIGNED NULL, 

  note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_call_campaign (campaign_id),
  INDEX idx_call_prospect (prospect_id),
  INDEX idx_call_user (user_id),
  INDEX idx_call_result (result),
  INDEX idx_call_campaign_created (campaign_id, created_at),

  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (refusal_reason_id) REFERENCES refusal_reasons(id) ON DELETE SET NULL
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS imports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  filename VARCHAR(255) NULL,
  row_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_import_campaign (campaign_id),
  INDEX idx_import_user (user_id),

  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS meetings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  call_log_id BIGINT UNSIGNED NOT NULL,
  meeting_at DATETIME NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'planned',
  location VARCHAR(190) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_meeting_call_log (call_log_id),
  INDEX idx_meeting_at (meeting_at),

  FOREIGN KEY (call_log_id) REFERENCES call_logs(id) ON DELETE CASCADE
) ENGINE=InnoDB;