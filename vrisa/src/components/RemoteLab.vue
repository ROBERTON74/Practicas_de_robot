<template>
  <div class="container-fluid">
    <div class="card">
      <div class="card-header text-center">
        <div class="row align-middle">
          <div v-if="lab.started" class="col">
            <button v-show="lab.counter == 0" @click="warnStop()" type="button" class="btn btn-outline-danger mb-3"><i
                class="bi bi-stop"></i>Terminar actividad</button>
            <h6>Tiempo restante: <span class="text-primary fw-bold">{{ remaining }}</span></h6>
          </div>
          <div v-else class="col">
            <div v-if="lab.error.length > 0" class="alert alert-warning mt-3" role="alert">{{ lab.error }}</div>
            <button @click="start()" type="button" class="btn btn-outline-success"><i class="bi bi-play" />Comenzar
              Actividad</button>
          </div>
        </div>
        <div v-if="showDescription" class="row">
          <div class="row mb-3">
            <h3>¿Estás seguro de que deseas terminar la sesión?</h3>
          </div>
          <div class="row">
            <div class="col"></div>
            <div class="col"><button @click="cancelStop" class="btn btn-sm btn-outline-primary">No, vuelve a la
                actividad</button></div>
            <div class="col"><span class="text-primary">{{ counterMessage }}</span></div>
            <div class="col"><button @click="stop()" class="btn btn-sm btn-outline-success">Sí, quiero salir de
                aquí</button></div>
            <div class="col"></div>
          </div>
        </div>
      </div>
      <div class="card-body">

        <!-- Remote Laboratory -->
        <div v-if="lab.started" class="container-fluid">
          <slot name="content">
            <!-- Embedded version -->
            <div v-show="lab.extern" class="container-fluid" v-html="lab.html"></div>

            <!-- Built-in version -->
            <div v-show="!lab.extern" class="row">
              <h1 class="text-center text-primary fw-bold" style="color: #990033">{{ lab.activity }}</h1>
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

        <!-- Activity description -->
        <div v-else class="container-fluid" v-html="lab.help"></div>

      </div>
      <div class="card-footer">
        <div v-if="lab.started" class="col">
          <h6>Tiempo restante: <span class="text-primary fw-bold">{{ remaining }}</span></h6>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Modal from '@/components/Modal.vue';
import ControlPanel from '@/components/lab/ControlPanel.vue';
import Plot from '@/components/lab/Plot.vue';
import NavBar from '@/components/NavBar.vue';
import { LabInstance } from '@/assets/LabControl.js';
import { computed, inject, onBeforeMount, reactive, ref } from 'vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';

const session = inject('session');
const props = defineProps(['builtin']);
// Data
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
const labcontrol = new LabInstance('147.96.71.236', '80', { onsignals, ondisconnect });
const disconnectionTimeout = 10;
const signals = { time: [], ref: [], u: [], y: [] };
// Computed
const remaining = computed(() => {
  const format = (x) => Math.floor(x).toString().padStart(2, '0');
  const minutes = format(lab.remainingSeconds / 60);
  const seconds = format(lab.remainingSeconds % 60);
  return minutes > 0 ? `${minutes}:${seconds}` : seconds;
});
const counterMessage = computed(() => `Desconexión en ${lab.counter} segundos`);
const showDescription = computed(() => lab.counter > 0);
// Methods
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
  Object.keys(signals).forEach((s, i) => {
    var excess = signals[s].length - MAX_POINTS;
    if (excess > 0) {
      signals[s].splice(0, excess);
    }
  });
};

function ondisconnect(reason) {
  console.log(`VUE Disconnect: ${reason}`);
  if (reason === 'io client disconnect') {
  } else if (reason === 'io server disconnect') {
  } else {
  }
};

async function start() {
  for (const s in signals) { signals[s] = []; }
  const lab_content = '';
  session
    .start(lab.activity)
    .then((response) => {
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
      lab.error = 'No se puede conectar con el laboratorio en este momento, prueba más tarde.';      
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
    this.stop();
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
      .then((response) => {
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
