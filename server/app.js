const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const {
  upsertUser,
  startSession,
  heartbeatSession,
  endSession,
  logMovement
} = require("./repository");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

const robotState = {
  axisX: 0,
  axisY: 0,
  axisZ: 0,
  grip: 0,
  lastUpdate: new Date().toISOString()
};

app.get("/api/health", async (_req, res) => {
  res.json({ ok: true, service: "robot-control-api" });
});

app.post("/api/users/login", async (req, res) => {
  try {
    const { username } = req.body;
    const userId = await upsertUser(username);
    const sessionId = await startSession(userId, {
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });

    res.json({ userId, sessionId });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message, error.code);
    res.status(400).json({ message: error.message || "No se pudo iniciar sesion" });
  }
});

app.post("/api/sessions/:id/heartbeat", async (req, res) => {
  try {
    await heartbeatSession(Number(req.params.id));
    res.json({ ok: true });
  } catch (_error) {
    res.status(500).json({ message: "No se pudo actualizar actividad" });
  }
});

app.post("/api/sessions/:id/end", async (req, res) => {
  try {
    await endSession(Number(req.params.id));
    res.json({ ok: true });
  } catch (_error) {
    res.status(500).json({ message: "No se pudo cerrar sesion" });
  }
});

app.post("/api/movements", async (req, res) => {
  try {
    const payload = req.body;
    await logMovement(payload);
    res.json({ ok: true });
  } catch (_error) {
    res.status(500).json({ message: "No se pudo guardar el movimiento" });
  }
});

io.on("connection", (socket) => {
  socket.emit("robot:state", robotState);

  socket.on("control:update", async (payload) => {
    robotState.axisX = Number(payload.axisX || 0);
    robotState.axisY = Number(payload.axisY || 0);
    robotState.axisZ = Number(payload.axisZ || 0);
    robotState.grip = Number(payload.grip || 0);
    robotState.lastUpdate = new Date().toISOString();

    socket.broadcast.emit("robot:state", robotState);

    if (payload.sessionId) {
      try {
        await logMovement({
          sessionId: payload.sessionId,
          axisX: robotState.axisX,
          axisY: robotState.axisY,
          axisZ: robotState.axisZ,
          grip: robotState.grip,
          keyPressed: payload.keyPressed || "unknown",
          speed: Number(payload.speed || 1),
          source: "socket"
        });
      } catch (_error) {
        // Logging failure should not interrupt real-time control.
      }
    }
  });
});

let currentPythonProcess = null;

app.post("/api/python/run", (req, res) => {
  if (currentPythonProcess) {
    return res.status(409).json({ message: "Ya hay un script en ejecucion. Detienelo primero." });
  }

  const { code } = req.body;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ message: "Codigo invalido" });
  }

  const serverPathPy = JSON.stringify(__dirname);
  const header = `import sys\nsys.path.insert(0, ${serverPathPy})\nfrom robot_api import Robot\nrobot = Robot()\n\n`;
  const tmpFile = path.join(os.tmpdir(), `robot_script_${Date.now()}.py`);

  try {
    fs.writeFileSync(tmpFile, header + code + "\n", "utf8");
  } catch (_) {
    return res.status(500).json({ message: "No se pudo preparar el script" });
  }

  let stdoutBuffer = "";
  const proc = spawn("python", [tmpFile]);
  currentPythonProcess = proc;

  res.json({ ok: true });

  proc.on("error", (err) => {
    currentPythonProcess = null;
    fs.unlink(tmpFile, () => {});
    io.emit("robot:python_log", { error: `No se pudo iniciar Python: ${err.message}` });
    io.emit("robot:python_done", { exitCode: -1 });
  });

  proc.stdout.on("data", (data) => {
    stdoutBuffer += data.toString();
    const lines = stdoutBuffer.split("\n");
    stdoutBuffer = lines.pop();
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        io.emit("robot:python_command", JSON.parse(trimmed));
      } catch (_) {
        io.emit("robot:python_log", { message: trimmed });
      }
    }
  });

  proc.stderr.on("data", (data) => {
    io.emit("robot:python_log", { error: data.toString().trim() });
  });

  proc.on("close", (exitCode) => {
    if (stdoutBuffer.trim()) {
      try {
        io.emit("robot:python_command", JSON.parse(stdoutBuffer.trim()));
      } catch (_) {
        io.emit("robot:python_log", { message: stdoutBuffer.trim() });
      }
    }
    io.emit("robot:python_done", { exitCode: exitCode ?? 0 });
    fs.unlink(tmpFile, () => {});
    currentPythonProcess = null;
  });
});

app.post("/api/python/stop", (_req, res) => {
  if (currentPythonProcess) {
    currentPythonProcess.kill();
    currentPythonProcess = null;
    res.json({ ok: true });
  } else {
    res.json({ ok: false, message: "No hay script en ejecucion" });
  }
});

const PORT = Number(process.env.PORT || 3000);
server.listen(PORT, () => {
  console.log(`Robot web app listening on http://localhost:${PORT}`);
  console.log(`DB config: host=${process.env.DB_HOST} port=${process.env.DB_PORT} user=${process.env.DB_USER} db=${process.env.DB_NAME}`);
});
