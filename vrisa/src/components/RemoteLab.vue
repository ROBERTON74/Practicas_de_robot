<template>
  <div class="remote-page">
    <div class="remote-shell vr-panel">
      <div class="remote-header">
        <div>
          <span class="vr-eyebrow">Laboratorio remoto</span>
          <h1>{{ lab.activity }}</h1>
        </div>
        <div class="remote-actions">
          <div v-if="lab.started" class="session-status">
            <span>Tiempo restante</span>
            <strong>{{ remaining }}</strong>
            <button v-show="lab.counter == 0" @click="warnStop()" type="button" class="btn btn-outline-danger">
              <i class="bi bi-stop"></i> Terminar
            </button>
          </div>
          <div v-else>
            <div v-if="lab.error.length > 0" class="alert alert-warning mt-3" role="alert">{{ lab.error }}</div>
            <button @click="start()" type="button" class="btn btn-success btn-lg">
              <i class="bi bi-play"></i> Comenzar actividad
            </button>
          </div>
        </div>
        <div v-if="showDescription" class="stop-confirm">
          <h2>Confirmar cierre de sesion</h2>
          <span>{{ counterMessage }}</span>
          <button @click="cancelStop" class="btn btn-sm btn-outline-primary">Volver a la actividad</button>
          <button @click="stop()" class="btn btn-sm btn-success">Salir ahora</button>
        </div>
      </div>

      <div class="remote-body">
        <div v-if="lab.started">
          <slot name="content">
            <div v-show="lab.extern" class="remote-frame" v-html="lab.html"></div>

            <div v-show="!lab.extern" class="row">
              <h2 class="text-center fw-bold">{{ lab.activity }}</h2>
            </div>
            <div v-if="!lab.extern" class="row row-cols-1 row-cols-sm-2 row-cols-lg-3">
              <Plot v-for="i in lab.graphs.keys()" id="plote" :graph="lab.graphs[i]" :signals="signals">{{ i }}
              </Plot>
              <ControlPanel :labcontrol="labcontrol" :controllerModel="lab.controllerModel"
                :controls="lab.controls[0]">
              </ControlPanel>
            </div>
          </slot>
        </div>

        <div v-else class="activity-help" v-html="lab.help"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ControlPanel from '@/components/lab/ControlPanel.vue';
import Plot from '@/components/lab/Plot.vue';
import { LabInstance } from '@/assets/LabControl.js';
import { computed, inject, onBeforeMount, reactive } from 'vue';
import { useRoute } from 'vue-router';

const session = inject('session');
defineProps(['builtin']);

const lab = reactive({
  title: '',
  started: false,
  activity: '',
  help: '',
  html: '',
  error: '',
  extern: false,
  remainingSeconds: 0,
  clock: setInterval(() => {
    if (lab.remainingSeconds <= 0) {
        return stop();
    }
    lab.remainingSeconds--;
  }, 1000),
  counter: 0,
  waitingForDisconnection: false,
});
const labcontrol = new LabInstance(
  window.location.hostname,
  Number(window.location.port || 80),
  { onsignals, ondisconnect }
);
const disconnectionTimeout = 10;
const signals = { time: [], ref: [], u: [], y: [] };

const remaining = computed(() => {
  const format = (x) => Math.floor(x).toString().padStart(2, '0');
  const minutes = format(lab.remainingSeconds / 60);
  const seconds = format(lab.remainingSeconds % 60);
  return minutes > 0 ? `${minutes}:${seconds}` : seconds;
});
const counterMessage = computed(() => `Desconexion en ${lab.counter} segundos`);
const showDescription = computed(() => lab.counter > 0);

function onsignals(data) {
  const MAX_POINTS = 500;
  data.history.forEach((state) => {
    if (!state) {
      return;
    }
    try {
      Object.keys(signals).forEach((s, i) => {
        signals[s].push(state[i]);
      });
    } catch (e) {
      console.log(e);
    }
  });
  Object.keys(signals).forEach((s) => {
    var excess = signals[s].length - MAX_POINTS;
    if (excess > 0) {
      signals[s].splice(0, excess);
    }
  });
};

function ondisconnect(reason) {
  console.log(`VUE Disconnect: ${reason}`);
};

async function start() {
  for (const s in signals) { signals[s] = []; }
  session
    .start(lab.activity)
    .then(() => {
      const activity = session.activity;
      lab.remainingSeconds = Math.floor(activity.exp - Date.now() / 1000);
      lab.controllerModel = activity.model;

      lab.extern = (activity.viewmodel == null);
      if(activity.viewmodel) {
        lab.viewModel = activity.viewmodel;
        lab.graphs = activity.viewmodel.graphs;
        lab.controls = activity.viewmodel.controls;
      }
      const url = session.getRemoteURL(lab.activity);
      return lab.extern ?
          session.get(url).then(async (response) => response.text())
        : labcontrol.connect();
    })
    .then((config) => {
      if (lab.extern) {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(config, 'text/html');
          const iframeSrc = doc.querySelector('iframe')?.getAttribute('src');
          lab.html = iframeSrc
            ? `<iframe style="width:100%;height:80vh;border:0;" src="${iframeSrc}"></iframe>`
            : config;
        } catch(e) {
          lab.html = config;
        }
      }
      lab.started = true;
    })
    .catch((error) => {
      console.error(error);
      lab.error = 'No se puede conectar con el laboratorio en este momento, prueba mas tarde.';
    });
};

async function warnStop() {
  if (!lab.extern) {
    await labcontrol.disconnect();
  }
  const waitNextSecond = () => {
    if (lab.waitingForDisconnection) {
      lab.counter--;
      setTimeout(waitNextSecond, 1000);
    }
    if (lab.counter > 0 || !lab.waitingForDisconnection) {
      return;
    }
    stop();
  };
  lab.waitingForDisconnection = true;
  lab.counter = disconnectionTimeout;
  waitNextSecond();
};

function cancelStop() {
  lab.waitingForDisconnection = false;
  lab.counter = 0;
  if (!lab.extern) {
    labcontrol
      .connect()
      .then(() => {
        lab.started = true;
      })
      .catch((error) => {
        console.log(error);
      });
  }
};

function stop() {
  lab.started = false;
  lab.waitingForDisconnection = false;
  lab.counter = 0;
  labcontrol.disconnect();
};

onBeforeMount(async () => {
  const route = useRoute();
  lab.activity = route.query.name;
  lab.help = await session.getHelp(lab.activity).catch(error => error.message);
});
</script>

<style scoped>
.remote-page {
  display: grid;
  gap: 16px;
}

.remote-shell {
  overflow: hidden;
}

.remote-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 20px;
  background: rgba(248, 250, 252, 0.94);
  border-bottom: 1px solid var(--vrisa-line);
  flex-wrap: wrap;
}

.remote-header h1 {
  margin: 4px 0 0;
  font-size: clamp(1.35rem, 2vw, 1.9rem);
  font-weight: 700;
}

.remote-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 260px;
}

.session-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.session-status span {
  color: var(--vrisa-muted);
  font-size: 0.82rem;
  font-weight: 700;
}

.session-status strong {
  padding: 8px 10px;
  color: var(--vrisa-primary-dark);
  background: #ccfbf1;
  border-radius: 6px;
}

.stop-confirm {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--vrisa-line);
}

.stop-confirm h2 {
  margin: 0 auto 0 0;
  font-size: 1rem;
  font-weight: 700;
}

.remote-body {
  padding: 14px;
}

.remote-frame :deep(iframe) {
  width: 100% !important;
  min-height: 80vh;
  border: 0;
  border-radius: 6px;
  background: #fff;
}

.activity-help {
  padding: 16px;
  background: #fff;
  border: 1px solid var(--vrisa-line);
  border-radius: 6px;
}

@media (max-width: 860px) {
  .remote-header {
    flex-direction: column;
  }

  .remote-actions,
  .session-status,
  .stop-confirm {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
