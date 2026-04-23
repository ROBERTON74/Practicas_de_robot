CREATE DATABASE IF NOT EXISTS robot_mecanico;
USE robot_mecanico;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS control_sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  started_at DATETIME NOT NULL,
  last_active DATETIME NOT NULL,
  ended_at DATETIME NULL,
  duration_seconds INT NULL,
  CONSTRAINT fk_control_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_control_sessions_user_started (user_id, started_at)
);

CREATE TABLE IF NOT EXISTS movement_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id BIGINT NOT NULL,
  axis_x DECIMAL(8,3) NOT NULL,
  axis_y DECIMAL(8,3) NOT NULL,
  axis_z DECIMAL(8,3) NOT NULL,
  grip DECIMAL(8,3) NOT NULL,
  key_pressed VARCHAR(120) NOT NULL,
  speed DECIMAL(6,2) NOT NULL,
  source VARCHAR(20) NOT NULL DEFAULT 'web',
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_movement_logs_session
    FOREIGN KEY (session_id) REFERENCES control_sessions(id)
    ON DELETE CASCADE,
  INDEX idx_movement_session_created (session_id, created_at)
);

CREATE TABLE IF NOT EXISTS robot_state (
  id TINYINT PRIMARY KEY,
  axis_x DECIMAL(8,3) NOT NULL,
  axis_y DECIMAL(8,3) NOT NULL,
  axis_z DECIMAL(8,3) NOT NULL,
  grip DECIMAL(8,3) NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_type VARCHAR(80) NOT NULL,
  detail JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
