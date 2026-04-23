const dotenv = require("dotenv");
const { query } = require("../server/db");

dotenv.config();

function sendResponse(id, result) {
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`);
}

function sendError(id, code, message) {
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } })}\n`);
}

async function handleCallTool(args = {}) {
  const name = args.name;
  const input = args.arguments || {};

  if (name === "query_robot_state") {
    const rows = await query("SELECT * FROM robot_state WHERE id = 1");
    return { content: [{ type: "text", text: JSON.stringify(rows[0] || {}) }] };
  }

  if (name === "create_user_session") {
    const username = String(input.username || "").trim();
    if (!username) {
      throw new Error("username es obligatorio");
    }

    let rows = await query("SELECT id FROM users WHERE username = ? LIMIT 1", [username]);
    let userId = rows[0] && rows[0].id;

    if (!userId) {
      const insertUser = await query("INSERT INTO users (username) VALUES (?)", [username]);
      userId = insertUser.insertId;
    }

    const session = await query(
      "INSERT INTO control_sessions (user_id, ip_address, user_agent, started_at, last_active) VALUES (?, ?, ?, NOW(), NOW())",
      [userId, input.ipAddress || null, input.userAgent || "mcp-client"]
    );

    return {
      content: [{ type: "text", text: JSON.stringify({ userId, sessionId: session.insertId }) }]
    };
  }

  if (name === "log_robot_movement") {
    await query(
      `INSERT INTO movement_logs
      (session_id, axis_x, axis_y, axis_z, grip, key_pressed, speed, source, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'mcp', NOW())`,
      [
        Number(input.sessionId),
        Number(input.axisX || 0),
        Number(input.axisY || 0),
        Number(input.axisZ || 0),
        Number(input.grip || 0),
        String(input.keyPressed || "none"),
        Number(input.speed || 1)
      ]
    );

    return { content: [{ type: "text", text: "movement logged" }] };
  }

  throw new Error(`Herramienta MCP no soportada: ${name}`);
}

async function handleMessage(line) {
  let message;
  try {
    message = JSON.parse(line);
  } catch (_error) {
    return;
  }

  const { id, method, params } = message;

  try {
    if (method === "initialize") {
      return sendResponse(id, {
        protocolVersion: "2024-11-05",
        serverInfo: {
          name: "robot-mcp-server",
          version: "1.0.0"
        },
        capabilities: {
          tools: {}
        }
      });
    }

    if (method === "tools/list") {
      return sendResponse(id, {
        tools: [
          {
            name: "query_robot_state",
            description: "Obtiene el estado actual del robot desde MySQL",
            inputSchema: { type: "object", properties: {} }
          },
          {
            name: "create_user_session",
            description: "Crea o reutiliza usuario y abre una sesion de control",
            inputSchema: {
              type: "object",
              properties: {
                username: { type: "string" },
                ipAddress: { type: "string" },
                userAgent: { type: "string" }
              },
              required: ["username"]
            }
          },
          {
            name: "log_robot_movement",
            description: "Registra un movimiento del robot",
            inputSchema: {
              type: "object",
              properties: {
                sessionId: { type: "number" },
                axisX: { type: "number" },
                axisY: { type: "number" },
                axisZ: { type: "number" },
                grip: { type: "number" },
                keyPressed: { type: "string" },
                speed: { type: "number" }
              },
              required: ["sessionId"]
            }
          }
        ]
      });
    }

    if (method === "tools/call") {
      const result = await handleCallTool(params);
      return sendResponse(id, result);
    }

    if (method === "notifications/initialized") {
      return;
    }

    sendError(id, -32601, `Metodo no soportado: ${method}`);
  } catch (error) {
    sendError(id, -32000, error.message || "Error interno MCP");
  }
}

let buffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", async (chunk) => {
  buffer += chunk;

  let idx = buffer.indexOf("\n");
  while (idx >= 0) {
    const line = buffer.slice(0, idx).trim();
    buffer = buffer.slice(idx + 1);

    if (line) {
      await handleMessage(line);
    }

    idx = buffer.indexOf("\n");
  }
});
