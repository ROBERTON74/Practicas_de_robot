<template>
  <div class="row row-cols-3">
    <div class="col col-1"></div>
    <div v-for="activity in model.activities" class="card text-center col-10">
      <div class="card-header">
        <h5 class="text-center">Conexiones recientes a {{activity}}</h5>
      </div>
      <div class="card-body">
        <table class="container-fluid mx-auto table table-striped table-sm">
          <thead>
            <tr>
              <th class="align-middle" scope="col">Usuario</th>
              <th class="align-middle" scope="col">Datos</th>
              <th class="align-middle" scope="col">Inicio</th>
              <th class="align-middle" scope="col">Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in model.sessions[activity]" :key="e.id">
              <td class="text-start">{{ e.UserUsername }}</td>
              <td class="text-start">
                <button class="btn p-0 link-primary" @click="download(e.data)">
                  <i class="bi bi-download mx-2"></i>{{ e.data }}
                </button>
              </td>
              <td class="text-start">{{ e.UserUsername }}</td>
              <td class="text-center">{{ duration(e) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="col-1"></div>
  </div>
</template>

<script setup>
import { inject, onMounted, reactive } from 'vue';

const session = inject('session');
const model = reactive({
  activities: [],
  sessions: [],
});

const duration = (activity) => {
  var time = (new Date(activity.finishedAt) - new Date(activity.startedAt)) / 60000;
  var minutes = Math.floor(time);
  var seconds = (time - minutes) * 60;
  return (minutes > 0) ? `${minutes} min. ${seconds.toFixed(0)} s.` : `${seconds.toFixed(0)} s.`; 
}

function download(name) {
  session.downloadExperiment(name)
    .then(response => response.text())
    .then(result => {
      const data = new Blob([result], { type: 'text/csv' })
      const link = document.createElement('a');
      link.href = URL.createObjectURL(data);
      link.download = name;
      link.click();
      URL.revokeObjectURL(data);
    })
    .catch(error => {
      console.log(error)
    })
}

onMounted(async () => {
  session
    .query('session/get', { order: [ ['startedAt', 'DESC'] ]})
    .then(response => response.json())
    .then(result => {
      let grouped = {}, activities = [];
      result.forEach(r => {
        if (!(r.ActivityName in grouped)) {
          activities.push(r.ActivityName)
          grouped[r.ActivityName] = [];
        }
        grouped[r.ActivityName].push(r);
      })
      model.activities = activities;
      model.sessions = grouped;
    })
    .catch((error) => {
      console.log(error);
    });
});
</script>