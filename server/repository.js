const { query } = require("./db");

async function upsertUser(username) {
  const trimmed = String(username || "").trim();
  if (!trimmed) {
    throw new Error("El username es obligatorio");
  }

  const existing = await query("SELECT id FROM users WHERE username = ? LIMIT 1", [trimmed]);
  if (existing.length > 0) {
    return existing[0].id;
  }

  const result = await query("INSERT INTO users (username) VALUES (?)", [trimmed]);
  return result.insertId;
}

async function startSession(userId, clientMeta = {}) {
  const ipAddress = clientMeta.ipAddress || null;
  const userAgent = clientMeta.userAgent || null;

  const result = await query(
    "INSERT INTO control_sessions (user_id, ip_address, user_agent, started_at, last_active) VALUES (?, ?, ?, NOW(), NOW())",
    [userId, ipAddress, userAgent]
  );

  return result.insertId;
}

async function heartbeatSession(sessionId) {
  await query("UPDATE control_sessions SET last_active = NOW() WHERE id = ?", [sessionId]);
}

async function endSession(sessionId) {
  await query(
    `UPDATE control_sessions
     SET ended_at = NOW(),
         duration_seconds = TIMESTAMPDIFF(SECOND, started_at, NOW())
     WHERE id = ?`,
    [sessionId]
  );
}

async function logMovement(movement) {
  const {
    sessionId,
    axisX,
    axisY,
    axisZ,
    grip,
    keyPressed,
    speed,
    source = "web"
  } = movement;

  await query(
    `INSERT INTO movement_logs
      (session_id, axis_x, axis_y, axis_z, grip, key_pressed, speed, source, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [sessionId, axisX, axisY, axisZ, grip, keyPressed, speed, source]
  );

  await query(
    `INSERT INTO robot_state (id, axis_x, axis_y, axis_z, grip, updated_at)
     VALUES (1, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       axis_x = VALUES(axis_x),
       axis_y = VALUES(axis_y),
       axis_z = VALUES(axis_z),
       grip = VALUES(grip),
       updated_at = NOW()`,
    [axisX, axisY, axisZ, grip]
  );
}

module.exports = {
  upsertUser,
  startSession,
  heartbeatSession,
  endSession,
  logMovement
};
