import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js";

const socket = io();

const UNIT_PER_MM = 0.01;
const MM_PER_UNIT = 100;

// Configuracion aproximada a DOBOT M1 segun ejes descritos por el usuario.
const model = {
  link1: 2.0,
  link2: 2.0,
  baseHeight: 0.92,
  j1Min: -90,
  j1Max: 90,
  j2Min: -135,
  j2Max: 135,
  zMinMm: 0,
  zMaxMm: 250,
  rMin: -180,
  rMax: 180,
  j1Speed: 95,
  j2Speed: 130,
  zSpeedMm: 180,
  rSpeed: 200
};

const state = {
  sessionId: null,
  userId: null,
  username: "",
  j1Deg: 8,
  j2Deg: -38,
  zMm: 120,
  rDeg: 0,
  tcpXMm: 0,
  tcpYMm: 0,
  speed: 1
};

const target = {
  j1Deg: 8,
  j2Deg: -38,
  zMm: 120,
  rDeg: 0
};

const keyboard = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  s: false,
  q: false,
  e: false
};

const axisXEl = document.getElementById("axis-x");
const axisYEl = document.getElementById("axis-y");
const axisZEl = document.getElementById("axis-z");
const axisREl = document.getElementById("axis-r");
const jointJ1El = document.getElementById("joint-j1");
const jointJ2El = document.getElementById("joint-j2");
const sessionTextEl = document.getElementById("session-text");
const loginModal = document.getElementById("login-modal");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");
const usernameInput = document.getElementById("username");

let scene;
let camera;
let renderer;
let zCarrier;
let joint1;
let joint2;
let wrist;
let tool;
let tcpMarker;
let fingerLeft;
let fingerRight;
let grippedObject = null;
const floorObjects = [];
const fallingObjects = [];
const gripState = { isOpen: true, aperture: 1.0, speed: 3.0 };

const orbit = {
  isDown: false,
  lastX: 0,
  lastY: 0,
  theta: 0.81,
  phi: 1.24,
  radius: 10.5,
  target: new THREE.Vector3(0, 1.7, 0)
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function moveTowards(current, wanted, maxDelta) {
  const delta = wanted - current;
  if (Math.abs(delta) <= maxDelta) {
    return wanted;
  }
  return current + Math.sign(delta) * maxDelta;
}

function degToRad(value) {
  return (value * Math.PI) / 180;
}

function radToDeg(value) {
  return (value * 180) / Math.PI;
}

function normalizeR(deg) {
  let d = deg;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

function forwardKinematics(j1Deg, j2Deg) {
  const t1 = degToRad(j1Deg);
  const t12 = degToRad(j1Deg + j2Deg);

  const x = model.link1 * Math.cos(t1) + model.link2 * Math.cos(t12);
  const y = model.link1 * Math.sin(t1) + model.link2 * Math.sin(t12);

  return { x, y };
}

function solveIKFromTcp(x, y) {
  const l1 = model.link1;
  const l2 = model.link2;
  const r2 = x * x + y * y;
  const cosJ2 = clamp((r2 - l1 * l1 - l2 * l2) / (2 * l1 * l2), -1, 1);

  // Configuracion codo-abajo similar a un SCARA industrial compacto.
  const j2Rad = -Math.acos(cosJ2);
  const k1 = l1 + l2 * Math.cos(j2Rad);
  const k2 = l2 * Math.sin(j2Rad);
  const j1Rad = Math.atan2(y, x) - Math.atan2(k2, k1);

  return {
    j1Deg: clamp(radToDeg(j1Rad), model.j1Min, model.j1Max),
    j2Deg: clamp(radToDeg(j2Rad), model.j2Min, model.j2Max)
  };
}

function initThree() {
  const canvas = document.getElementById("robot-canvas");

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(7.2, 5.1, 6.8);
  camera.lookAt(0, 1.7, 0);

  const hemi = new THREE.HemisphereLight(0xf3ffff, 0x091726, 1.3);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffffff, 1.15);
  sun.position.set(6, 9, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 30;
  sun.shadow.camera.left = -8;
  sun.shadow.camera.right = 8;
  sun.shadow.camera.top = 8;
  sun.shadow.camera.bottom = -8;
  scene.add(sun);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(6, 80),
    new THREE.MeshStandardMaterial({ color: 0x0a1c2e, metalness: 0.2, roughness: 0.84 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const maxReach = model.link1 + model.link2;
  const minReach = Math.abs(model.link1 - model.link2);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(minReach, maxReach, 100),
    new THREE.MeshBasicMaterial({ color: 0x10deb0, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  scene.add(ring);

  const white = new THREE.MeshStandardMaterial({ color: 0xe9f3f6, metalness: 0.7, roughness: 0.28 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1f3e52, metalness: 0.65, roughness: 0.35 });

  const base = new THREE.Group();
  scene.add(base);

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 1.2, 50), dark);
  pedestal.position.y = 0.6;
  base.add(pedestal);

  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.7, 40), white);
  tower.position.y = 1.95;
  base.add(tower);

  zCarrier = new THREE.Group();
  zCarrier.position.y = model.baseHeight + state.zMm * UNIT_PER_MM;
  base.add(zCarrier);

  const axis3Head = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.4, 0.35, 40), white);
  axis3Head.position.y = 0.08;
  zCarrier.add(axis3Head);

  joint1 = new THREE.Group();
  joint1.position.set(0, 0.15, 0);
  zCarrier.add(joint1);

  const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.26, 30), dark);
  shoulder.rotation.x = Math.PI / 2;
  joint1.add(shoulder);

  const link1Mesh = new THREE.Mesh(new THREE.BoxGeometry(model.link1, 0.2, 0.28), white);
  link1Mesh.position.x = model.link1 / 2;
  joint1.add(link1Mesh);

  joint2 = new THREE.Group();
  joint2.position.x = model.link1;
  joint1.add(joint2);

  const elbow = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.22, 28), dark);
  elbow.rotation.x = Math.PI / 2;
  joint2.add(elbow);

  const link2Mesh = new THREE.Mesh(new THREE.BoxGeometry(model.link2, 0.2, 0.28), white);
  link2Mesh.position.x = model.link2 / 2;
  joint2.add(link2Mesh);

  wrist = new THREE.Group();
  wrist.position.x = model.link2;
  joint2.add(wrist);

  const wristBody = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 24), dark);
  wristBody.rotation.x = Math.PI / 2;
  wrist.add(wristBody);

  tool = new THREE.Group();
  wrist.add(tool);

  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 0.58, 22),
    new THREE.MeshStandardMaterial({ color: 0x8ffff2, metalness: 0.9, roughness: 0.2 })
  );
  nozzle.position.y = -0.32;
  tool.add(nozzle);

  const tip = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.09, 0.2), white);
  tip.position.y = -0.65;
  tool.add(tip);

  // --- Pinza (gripper) ---
  const fingerMat = new THREE.MeshStandardMaterial({ color: 0x00d9a5, metalness: 0.8, roughness: 0.2 });
  fingerLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.05), fingerMat);
  fingerLeft.position.set(0, -0.72, 0.1);
  tool.add(fingerLeft);

  fingerRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.05), fingerMat);
  fingerRight.position.set(0, -0.72, -0.1);
  tool.add(fingerRight);

  // --- Marcador TCP ---
  tcpMarker = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.85 })
  );
  scene.add(tcpMarker);

  // --- Rejilla ---
  const grid = new THREE.GridHelper(12, 12, 0x1a4060, 0x0d2030);
  grid.position.y = 0.005;
  scene.add(grid);

  // --- Indicadores de ejes ---
  const axesHelper = new THREE.AxesHelper(1.5);
  axesHelper.position.y = 0.01;
  scene.add(axesHelper);

  // --- Sombras en todos los meshes ---
  scene.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  // --- Objetos en el suelo para coger con la pinza ---
  const objectDefs = [
    { color: 0xff3344, x: 2.5, z: 0.0 },
    { color: 0x3388ff, x: 2.0, z: -1.5 },
    { color: 0xffcc00, x: 1.5, z: 1.5 },
    { color: 0x44ff88, x: 3.0, z: -0.8 }
  ];
  const objGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
  for (const def of objectDefs) {
    const floorObj = new THREE.Mesh(
      objGeo,
      new THREE.MeshStandardMaterial({ color: def.color, metalness: 0.2, roughness: 0.5 })
    );
    floorObj.position.set(def.x, 0.11, def.z);
    floorObj.castShadow = true;
    floorObj.receiveShadow = true;
    floorObj.userData.isGrabbed = false;
    scene.add(floorObj);
    floorObjects.push(floorObj);
  }

  // --- Controles de camara con el raton ---
  const canvas2 = renderer.domElement;

  canvas2.addEventListener("mousedown", (e) => {
    orbit.isDown = true;
    orbit.lastX = e.clientX;
    orbit.lastY = e.clientY;
  });

  window.addEventListener("mouseup", () => {
    orbit.isDown = false;
  });

  canvas2.addEventListener("mousemove", (e) => {
    if (!orbit.isDown) return;
    const dx = e.clientX - orbit.lastX;
    const dy = e.clientY - orbit.lastY;
    orbit.lastX = e.clientX;
    orbit.lastY = e.clientY;
    orbit.theta -= dx * 0.008;
    orbit.phi = Math.max(0.15, Math.min(Math.PI - 0.15, orbit.phi + dy * 0.008));
  });

  canvas2.addEventListener("wheel", (e) => {
    orbit.radius = Math.max(3, Math.min(22, orbit.radius + e.deltaY * 0.02));
    e.preventDefault();
  }, { passive: false });

  window.addEventListener("resize", onResize);
}

function onResize() {
  const canvas = document.getElementById("robot-canvas");
  const { clientWidth, clientHeight } = canvas;
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight, false);
}

function applyKeyboard(delta) {
  const d1 = model.j1Speed * delta * state.speed;
  const d2 = model.j2Speed * delta * state.speed;
  const dz = model.zSpeedMm * delta * state.speed;
  const dr = model.rSpeed * delta * state.speed;

  let changed = false;

  if (keyboard.ArrowLeft) {
    target.j1Deg -= d1;
    changed = true;
  }
  if (keyboard.ArrowRight) {
    target.j1Deg += d1;
    changed = true;
  }
  if (keyboard.ArrowUp) {
    target.j2Deg -= d2;
    changed = true;
  }
  if (keyboard.ArrowDown) {
    target.j2Deg += d2;
    changed = true;
  }
  if (keyboard.w) {
    target.zMm += dz;
    changed = true;
  }
  if (keyboard.s) {
    target.zMm -= dz;
    changed = true;
  }
  if (keyboard.q) {
    target.rDeg += dr;
    changed = true;
  }
  if (keyboard.e) {
    target.rDeg -= dr;
    changed = true;
  }

  target.j1Deg = clamp(target.j1Deg, model.j1Min, model.j1Max);
  target.j2Deg = clamp(target.j2Deg, model.j2Min, model.j2Max);
  target.zMm = clamp(target.zMm, model.zMinMm, model.zMaxMm);
  target.rDeg = clamp(normalizeR(target.rDeg), model.rMin, model.rMax);

  return changed;
}

function integrateState(delta) {
  state.j1Deg = moveTowards(state.j1Deg, target.j1Deg, model.j1Speed * delta);
  state.j2Deg = moveTowards(state.j2Deg, target.j2Deg, model.j2Speed * delta);
  state.zMm = moveTowards(state.zMm, target.zMm, model.zSpeedMm * delta);
  state.rDeg = moveTowards(state.rDeg, target.rDeg, model.rSpeed * delta);

  state.j1Deg = clamp(state.j1Deg, model.j1Min, model.j1Max);
  state.j2Deg = clamp(state.j2Deg, model.j2Min, model.j2Max);
  state.zMm = clamp(state.zMm, model.zMinMm, model.zMaxMm);
  state.rDeg = clamp(normalizeR(state.rDeg), model.rMin, model.rMax);

  const tcp = forwardKinematics(state.j1Deg, state.j2Deg);
  state.tcpXMm = tcp.x * MM_PER_UNIT;
  state.tcpYMm = tcp.y * MM_PER_UNIT;
}

function applyPose() {
  zCarrier.position.y = model.baseHeight + state.zMm * UNIT_PER_MM;
  joint1.rotation.y = degToRad(state.j1Deg);
  joint2.rotation.y = degToRad(state.j2Deg);
  tool.rotation.y = degToRad(state.rDeg);

  jointJ1El.textContent = state.j1Deg.toFixed(1);
  jointJ2El.textContent = state.j2Deg.toFixed(1);
  axisZEl.textContent = state.zMm.toFixed(0);
  axisREl.textContent = state.rDeg.toFixed(1);
  axisXEl.textContent = state.tcpXMm.toFixed(0);
  axisYEl.textContent = state.tcpYMm.toFixed(0);
}

async function startLogin(username) {
  const response = await fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });

  if (!response.ok) {
    throw new Error("No se pudo iniciar sesion");
  }

  const data = await response.json();
  state.userId = data.userId;
  state.sessionId = data.sessionId;
  state.username = username;

  sessionTextEl.textContent = `Activo: ${username} | Sesion #${state.sessionId}`;
  logoutBtn.disabled = false;
  loginModal.style.display = "none";

  setInterval(() => {
    fetch(`/api/sessions/${state.sessionId}/heartbeat`, { method: "POST" });
  }, 15000);
}

function closeSession() {
  if (!state.sessionId) {
    return;
  }

  const url = `/api/sessions/${state.sessionId}/end`;
  navigator.sendBeacon(url);
}

window.addEventListener("beforeunload", closeSession);

logoutBtn.addEventListener("click", () => {
  closeSession();
  location.reload();
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await startLogin(usernameInput.value.trim());
  } catch (_error) {
    alert("No fue posible iniciar sesion");
  }
});

window.addEventListener("keydown", (event) => {
  if (document.activeElement === document.getElementById("py-editor")) return;
  const key = event.key;
  if (Object.prototype.hasOwnProperty.call(keyboard, key)) {
    keyboard[key] = true;
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  if (document.activeElement === document.getElementById("py-editor")) return;
  const key = event.key;
  if (Object.prototype.hasOwnProperty.call(keyboard, key)) {
    keyboard[key] = false;
    event.preventDefault();
  }
});

window.addEventListener("keydown", (event) => {
  if (document.activeElement === document.getElementById("py-editor")) return;
  if (event.code === "Space") {
    event.preventDefault();
    gripState.isOpen = !gripState.isOpen;
  }
});

socket.on("robot:state", (serverState) => {
  const incomingX = Number(serverState.axisX || 0) / MM_PER_UNIT;
  const incomingY = Number(serverState.axisY || 0) / MM_PER_UNIT;

  const ik = solveIKFromTcp(incomingX, incomingY);
  target.j1Deg = ik.j1Deg;
  target.j2Deg = ik.j2Deg;
  target.zMm = clamp(Number(serverState.axisZ || 0), model.zMinMm, model.zMaxMm);
  target.rDeg = clamp(normalizeR(Number(serverState.grip || 0)), model.rMin, model.rMax);
});

function applyGravity(delta) {
  const GRAVITY = 9.8;
  const GROUND = 0.11;
  for (let i = fallingObjects.length - 1; i >= 0; i--) {
    const obj = fallingObjects[i];
    obj.userData.velocityY -= GRAVITY * delta;
    obj.position.y += obj.userData.velocityY * delta;
    if (obj.position.y <= GROUND) {
      obj.position.y = GROUND;
      obj.userData.velocityY = 0;
      fallingObjects.splice(i, 1);
    }
  }
}

function updateGripper(delta) {
  const targetAperture = gripState.isOpen ? 1.0 : 0.0;
  gripState.aperture = moveTowards(gripState.aperture, targetAperture, gripState.speed * delta);

  const spread = 0.06 + 0.12 * gripState.aperture;
  fingerLeft.position.z = spread;
  fingerRight.position.z = -spread;

  const tipWorld = new THREE.Vector3(0, -0.65, 0);
  tool.localToWorld(tipWorld);
  tcpMarker.position.copy(tipWorld);

  const gripEl = document.getElementById("grip-status");
  if (gripEl) {
    if (grippedObject) {
      gripEl.textContent = "Cerrada (objeto cogido)";
      gripEl.className = "grip-has-object";
    } else if (gripState.isOpen) {
      gripEl.textContent = "Abierta";
      gripEl.className = "grip-open";
    } else {
      gripEl.textContent = "Cerrada";
      gripEl.className = "grip-closed";
    }
  }

  if (!gripState.isOpen && gripState.aperture < 0.25 && !grippedObject) {
    for (const obj of floorObjects) {
      if (obj.userData.isGrabbed) continue;
      const dist = tipWorld.distanceTo(obj.position);
      if (dist < 0.6) {
        const worldPos = new THREE.Vector3();
        obj.getWorldPosition(worldPos);
        tool.add(obj);
        tool.worldToLocal(worldPos);
        obj.position.copy(worldPos);
        obj.userData.isGrabbed = true;
        grippedObject = obj;
        break;
      }
    }
  } else if (gripState.isOpen && gripState.aperture > 0.75 && grippedObject) {
    const worldPos = new THREE.Vector3();
    grippedObject.getWorldPosition(worldPos);
    scene.add(grippedObject);
    grippedObject.position.copy(worldPos);
    grippedObject.userData.isGrabbed = false;
    grippedObject.userData.velocityY = 0;
    fallingObjects.push(grippedObject);
    grippedObject = null;
  }
}

let previousTime = performance.now();
function animate(now) {
  const delta = (now - previousTime) / 1000;
  previousTime = now;

  const changed = applyKeyboard(delta);
  integrateState(delta);
  applyPose();
  updateGripper(delta);
  applyGravity(delta);

  const ox = orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta);
  const oy = orbit.radius * Math.cos(orbit.phi);
  const oz = orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta);
  camera.position.set(orbit.target.x + ox, orbit.target.y + oy, orbit.target.z + oz);
  camera.lookAt(orbit.target);

  renderer.render(scene, camera);

  if (changed && state.sessionId) {
    const pressedKeys = Object.entries(keyboard)
      .filter((entry) => entry[1])
      .map((entry) => entry[0])
      .join(",");

    const payload = {
      sessionId: state.sessionId,
      axisX: Number(state.tcpXMm.toFixed(2)),
      axisY: Number(state.tcpYMm.toFixed(2)),
      axisZ: Number(state.zMm.toFixed(2)),
      grip: Number(state.rDeg.toFixed(2)),
      keyPressed: pressedKeys || "none",
      speed: state.speed
    };

    socket.emit("control:update", payload);

    fetch("/api/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  requestAnimationFrame(animate);
}

initThree();
integrateState(0.016);
applyPose();
requestAnimationFrame(animate);

// --- Programacion Python ---

const pyRunBtn = document.getElementById("py-run-btn");
const pyStopBtn = document.getElementById("py-stop-btn");
const pyClearBtn = document.getElementById("py-clear-btn");
const pyEditor = document.getElementById("py-editor");
const pyConsole = document.getElementById("py-console");

function pyLog(text, type = "normal") {
  const line = document.createElement("div");
  line.className = type === "error" ? "py-log-error" : type === "ok" ? "py-log-ok" : "py-log-line";
  line.textContent = text;
  pyConsole.appendChild(line);
  pyConsole.scrollTop = pyConsole.scrollHeight;
}

pyEditor.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const start = pyEditor.selectionStart;
    const end = pyEditor.selectionEnd;
    pyEditor.value = pyEditor.value.substring(0, start) + "    " + pyEditor.value.substring(end);
    pyEditor.selectionStart = pyEditor.selectionEnd = start + 4;
  }
});

socket.on("robot:python_command", (cmd) => {
  if (cmd.log !== undefined) {
    pyLog(`> ${cmd.log}`);
    return;
  }

  const val = Number(cmd.valor);
  if (cmd.eje === "j1") {
    target.j1Deg = clamp(val, model.j1Min, model.j1Max);
  } else if (cmd.eje === "j2") {
    target.j2Deg = clamp(val, model.j2Min, model.j2Max);
  } else if (cmd.eje === "z") {
    target.zMm = clamp(val, model.zMinMm, model.zMaxMm);
  } else if (cmd.eje === "r") {
    target.rDeg = clamp(normalizeR(val), model.rMin, model.rMax);
  }

  pyLog(`-> ${cmd.eje.toUpperCase()} = ${cmd.valor}`);

  if (state.sessionId) {
    socket.emit("control:update", {
      sessionId: state.sessionId,
      axisX: Number(state.tcpXMm.toFixed(2)),
      axisY: Number(state.tcpYMm.toFixed(2)),
      axisZ: Number(target.zMm.toFixed(2)),
      grip: Number(target.rDeg.toFixed(2)),
      keyPressed: `python:${cmd.eje}`,
      speed: state.speed
    });
  }
});

socket.on("robot:python_log", (data) => {
  pyLog(data.error || data.message || "", data.error ? "error" : "normal");
});

socket.on("robot:python_done", (data) => {
  if (data.exitCode === 0) {
    pyLog("Script completado correctamente.", "ok");
  } else {
    pyLog(`Script finalizado con codigo ${data.exitCode}.`, "error");
  }
  pyRunBtn.disabled = false;
  pyStopBtn.disabled = true;
});

pyRunBtn.addEventListener("click", async () => {
  const code = pyEditor.value.trim();
  if (!code) return;

  pyConsole.innerHTML = "";
  pyLog("Iniciando script...");
  pyRunBtn.disabled = true;
  pyStopBtn.disabled = false;

  try {
    const res = await fetch("/api/python/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    if (!res.ok) {
      const data = await res.json();
      pyLog(data.message || "Error al iniciar el script.", "error");
      pyRunBtn.disabled = false;
      pyStopBtn.disabled = true;
    }
  } catch (_) {
    pyLog("No se pudo conectar con el servidor.", "error");
    pyRunBtn.disabled = false;
    pyStopBtn.disabled = true;
  }
});

pyStopBtn.addEventListener("click", async () => {
  await fetch("/api/python/stop", { method: "POST" }).catch(() => {});
  pyLog("Script detenido.");
  pyRunBtn.disabled = false;
  pyStopBtn.disabled = true;
});

pyClearBtn.addEventListener("click", () => {
  pyConsole.innerHTML = "";
});
