// Script de importación SOLO para DOBOT M1 — NO toca las actividades existentes
// Ejecutar dentro del contenedor:
// docker exec docker-vrlabs_node-1 node /home/node/app/import_m1.js

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

[VIEWS_ZIP, VIEWS_SERVE, CTRL_DIR].forEach(d => {
  if (!fs.existsSync(d)) { fs.mkdirSync(d, { recursive: true }); }
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

async function main() {
  await sequelize.authenticate();
  console.log('Conectado a MySQL\n');

  // Eliminar actividad M1 anterior si existe (para poder reimportar)
  const existing = await Activity.findOne({ where: { name: 'Robot DOBOT M1' } });
  if (existing) {
    await existing.destroy();
    console.log('Actividad anterior "Robot DOBOT M1" eliminada.\n');
  }

  // --- Importar Vista del DOBOT M1 ---
  console.log('=== Importando Vista DOBOT M1 ===');
  let m1View;
  try {
    m1View = await importView('View_DOBOTM1.zip');
    console.log(`✓ Vista importada: ${m1View.name} (id: ${m1View.id})`);
  } catch(e) {
    console.error('✗ Error importando vista:', e.message);
    process.exit(1);
  }

  // --- Reusar controlador DOBOT existente ---
  // El M1 comparte protocolo similar al Magician para la simulación.
  // Cuando haya un controlador específico del M1, se actualizará aquí.
  const dobotCtrl = await Controller.findOne({ where: { name: 'DOBOT Controller' } });
  if (!dobotCtrl) {
    console.error('✗ No se encontró el controlador "DOBOT Controller". Importa los fixtures primero.');
    process.exit(1);
  }
  console.log(`✓ Controlador reutilizado: ${dobotCtrl.name} (id: ${dobotCtrl.id})`);

  // --- Crear Actividad DOBOT M1 ---
  console.log('\n=== Creando Actividad "Robot DOBOT M1" ===');
  let m1Act;
  try {
    m1Act = await Activity.create({
      name: 'Robot DOBOT M1',
      controllerName: dobotCtrl.name,
      viewName: m1View.name,
      ControllerId: dobotCtrl.id,
      ViewId: m1View.id,
      sessionTimeout: 30,
      disconnectTimeout: 10,
      state: 'idle',
    });
    console.log(`✓ Actividad creada: ${m1Act.name}`);
  } catch(e) {
    console.error('✗ Error creando actividad:', e.message);
    process.exit(1);
  }

  // --- Asignar al usuario admin ---
  console.log('\n=== Asignando actividad al usuario admin ===');
  const admin = await User.findOne({ where: { username: 'admin' } });
  if (admin) {
    try {
      await admin.addActivity(m1Act);
      console.log(`✓ "Robot DOBOT M1" asignada a admin`);
    } catch(e) { console.log(`✗ ${e.message}`); }
  } else {
    console.log('✗ Usuario admin no encontrado.');
  }

  console.log('\n=== IMPORTACIÓN M1 COMPLETADA ===');
  console.log('Recuerda asignar la imagen en MySQL con:');
  console.log('  UPDATE Activities SET image = \'DobotM1.jpg\' WHERE name = \'Robot DOBOT M1\';');
  process.exit(0);
}

main().catch(e => { console.error('Error fatal:', e.message); process.exit(1); });
