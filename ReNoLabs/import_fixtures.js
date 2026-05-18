// Script de importación de fixtures — ejecutar dentro del contenedor:
// docker exec docker-vrlabs_node-1 node /home/node/app/import_fixtures.js

const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

process.chdir('/home/node/app');
const { sequelize, View, Controller, Activity, User } = require('./src/models');

const FIXTURES   = '/home/node/app/fixtures';
const VIEWS_ZIP  = '/home/node/app/var/views';
const VIEWS_SERVE= '/home/node/app/public/views';
const CTRL_DIR   = '/home/node/app/var/controllers';

// Crear directorios necesarios
[VIEWS_ZIP, VIEWS_SERVE, CTRL_DIR].forEach(d => {
  if (!fs.existsSync(d)) { fs.mkdirSync(d, { recursive: true }); console.log('Creado:', d); }
});

function readMeta(zipPath) {
  const zip = new AdmZip(zipPath);
  const entry = zip.getEntry('_metadata.txt');
  if (!entry) return {};
  const lines = entry.getData().toString().split(/\r?\n/);
  const meta = {};
  lines.forEach(l => {
    const m = l.match(/^([^:]+):\s(.+)/);
    if (m) meta[m[1].trim()] = m[2].trim();
  });
  return meta;
}

async function importView(filename) {
  const src = path.join(FIXTURES, filename);
  const id = uuidv4();
  const zipDest = path.join(VIEWS_ZIP, id + '.zip');
  const extractDest = path.join(VIEWS_SERVE, id);

  fs.copyFileSync(src, zipDest);
  const meta = readMeta(zipDest);
  new AdmZip(zipDest).extractAllTo(extractDest, true);

  const view = await View.create({
    id,
    name: meta['title'] || filename,
    path: meta['main-simulation'] || '',
    description: meta['html-description'] || '',
    extern: false,
  });
  return view;
}

async function importController(filename) {
  const src = path.join(FIXTURES, filename);
  const id = uuidv4();
  const ctrlDest = path.join(CTRL_DIR, id);
  fs.mkdirSync(ctrlDest, { recursive: true });

  const zipPath = path.join(CTRL_DIR, id + '.zip');
  fs.copyFileSync(src, zipPath);
  new AdmZip(zipPath).extractAllTo(ctrlDest, true);
  const meta = readMeta(zipPath);

  const controller = await Controller.create({
    id,
    name: meta['name'] || filename,
    type: meta['type'] || 'Unknown',
    path: ctrlDest,
  });
  return controller;
}

async function main() {
  await sequelize.authenticate();
  console.log('Conectado a MySQL\n');

  // Borrar actividad de prueba anterior
  await Activity.destroy({ where: { name: 'Robot DOBOT Magician' } });

  // --- Importar Vistas ---
  console.log('=== Importando Vistas ===');
  const views = {};
  const viewMap = {
    'View_DOBOTMagician.zip':   'dobot',
    'View_AirLevitation.zip':   'air',
    'View_Sistemas Lineales.zip': 'sistemas',
  };
  for (const [file, key] of Object.entries(viewMap)) {
    try {
      const v = await importView(file);
      views[key] = v;
      console.log(`✓ ${v.name}`);
    } catch(e) { console.log(`✗ ${file}: ${e.message}`); }
  }

  // --- Importar Controladores ---
  console.log('\n=== Importando Controladores ===');
  const ctrls = {};
  const ctrlMap = {
    'Controller_DOBOT.zip':        'dobot',
    'Controller_Arduino.zip':      'arduino',
    'Controller_C_RPI.zip':        'crpi',
    'Controller_Circuitos_PC.zip': 'circuitos',
    'Controller_TwinCAT.zip':      'twincat',
    'Controller_Agent.zip':        'agent',
  };
  for (const [file, key] of Object.entries(ctrlMap)) {
    try {
      const c = await importController(file);
      ctrls[key] = c;
      console.log(`✓ ${c.name} (${c.type})`);
    } catch(e) { console.log(`✗ ${file}: ${e.message}`); }
  }

  // --- Crear Actividades ---
  console.log('\n=== Creando Actividades ===');
  const actDefs = [
    { name: 'Robot DOBOT Magician',   ctrl: 'dobot',    view: 'dobot'    },
    { name: 'Air Flow Levitation',    ctrl: 'arduino',  view: 'air'      },
    { name: 'Sistemas Lineales',      ctrl: 'crpi',     view: 'sistemas' },
  ];
  const created = [];
  for (const def of actDefs) {
    const c = ctrls[def.ctrl];
    const v = views[def.view];
    if (!c || !v) { console.log(`✗ ${def.name}: falta vista o controlador`); continue; }
    try {
      const act = await Activity.create({
        name: def.name,
        controllerName: c.name,
        viewName: v.name,
        ControllerId: c.id,
        ViewId: v.id,
        sessionTimeout: 30,
        disconnectTimeout: 10,
        state: 'idle',
      });
      created.push(act.name);
      console.log(`✓ ${act.name}`);
    } catch(e) { console.log(`✗ ${def.name}: ${e.message}`); }
  }

  // --- Asignar al admin ---
  console.log('\n=== Asignando actividades al usuario admin ===');
  const admin = await User.findOne({ where: { username: 'admin' } });
  for (const name of created) {
    try {
      const act = await Activity.findOne({ where: { name } });
      await admin.addActivity(act);
      console.log(`✓ ${name} → admin`);
    } catch(e) { console.log(`✗ ${name}: ${e.message}`); }
  }

  console.log('\n=== IMPORTACIÓN COMPLETADA ===');
  process.exit(0);
}

main().catch(e => { console.error('Error fatal:', e.message); process.exit(1); });
