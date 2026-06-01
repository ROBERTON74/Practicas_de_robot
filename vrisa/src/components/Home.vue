<template>
  <div v-if="model.user" class="home-grid">
    <section class="activities-section">
      <div class="section-header">
        <div>
          <span class="vr-eyebrow">Panel principal</span>
          <h1 class="vr-page-title">Actividades disponibles</h1>
        </div>
        <span class="activity-count">{{ model.activities.length }} laboratorios</span>
      </div>

      <div class="activity-grid">
        <article v-for="a in model.activities" v-bind:key="a.name" class="activity-card vr-panel"
          data-bs-toggle="tooltip" data-bs-placement="top" :title="a.description">
          <div class="activity-media">
            <img :src=a.image onerror="this.src='/vr-isa/images/vrlabs/VR-ISA-placeholder.png';"
              alt="Imagen de la actividad">
            <span :class="['activity-status', a.state == 'idle' ? 'is-free' : 'is-busy']">
              {{ a.state == 'idle' ? 'Disponible' : 'Ocupada' }}
            </span>
          </div>
          <div class="activity-body">
            <h2>{{ a.name }}</h2>
            <p>{{ a.description }}</p>
            <router-link v-if="a.state == 'idle'" :to="a.url" class="btn btn-success w-100">
              Entrar en la actividad
            </router-link>
            <router-link v-else :to="a.url" class="btn btn-outline-danger w-100">
              Actividad ocupada
            </router-link>
          </div>
        </article>
      </div>
    </section>

    <aside class="experiments-panel vr-panel">
      <div class="section-header compact">
        <div>
          <span class="vr-eyebrow">Datos</span>
          <h2>Ultimos experimentos</h2>
        </div>
      </div>

      <div id="data" class="experiment-list">
        <button v-for="e in model.experiments" v-bind:key="e.date" class="experiment-item" @click="download(e.name)">
          <i class="bi bi-download"></i>
          <span>{{ e.date }}</span>
        </button>
        <div v-if="model.experiments.length == 0" class="empty-state">
          Aun no hay experimentos descargables.
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { inject, onMounted, reactive } from 'vue';

const session = inject('session');
const model = reactive({
  user: null,
  activities: [],
  experiments: [],
});

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
  model.experiments = await session.getExperiments();
  session
    .query('user/get', {
      where: { username: session.user.username },
      include: ['activity'],
    })
    .then(response => response.json())
    .then(result => {
      model.user = result[0];
      model.activities = model.user.Activities.map((a) => {
        return {
          name: a.name,
          description: a.description,
          image: `activities/${a.image}`,
          url: `remotelab?name=${a.name}`,
          state: a.state,
        };
      });
    })
    .catch((error) => {
      console.log(error);
    });
});
</script>

<style scoped>
.home-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
  align-items: start;
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.section-header.compact {
  align-items: start;
  margin-bottom: 14px;
}

.section-header h2 {
  margin: 0;
  font-size: 1.18rem;
  font-weight: 700;
}

.activity-count {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 6px 12px;
  color: var(--vrisa-primary-dark);
  background: #ccfbf1;
  border-radius: 999px;
  font-weight: 700;
  white-space: nowrap;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.activity-card {
  min-width: 0;
  overflow: hidden;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.activity-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 48px rgba(24, 34, 48, 0.16);
}

.activity-media {
  position: relative;
  aspect-ratio: 16 / 10;
  background: #e8eef6;
  overflow: hidden;
}

.activity-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-status {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 5px 10px;
  border-radius: 999px;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
}

.activity-status.is-free {
  background: var(--vrisa-primary);
}

.activity-status.is-busy {
  background: var(--vrisa-danger);
}

.activity-body {
  padding: 16px;
}

.activity-body h2 {
  min-height: 52px;
  margin: 0 0 8px;
  font-size: clamp(0.98rem, 1vw, 1.12rem);
  font-weight: 700;
}

.activity-body p {
  min-height: 48px;
  margin: 0 0 14px;
  color: var(--vrisa-muted);
  font-size: 0.9rem;
}

.experiments-panel {
  position: sticky;
  top: 88px;
  padding: 18px;
}

.experiment-list {
  display: grid;
  gap: 8px;
}

.experiment-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 42px;
  padding: 9px 10px;
  color: var(--vrisa-accent);
  background: #f8fafc;
  border: 1px solid var(--vrisa-line);
  border-radius: 6px;
  text-align: left;
  font-weight: 700;
}

.experiment-item:hover {
  background: #eff6ff;
}

.empty-state {
  color: var(--vrisa-muted);
  background: #f8fafc;
  border: 1px dashed var(--vrisa-line);
  border-radius: 6px;
  padding: 16px;
}

@media (max-width: 1100px) {
  .home-grid {
    grid-template-columns: 1fr;
  }

  .activity-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .experiments-panel {
    position: static;
  }
}

@media (max-width: 600px) {
  .section-header {
    align-items: start;
    flex-direction: column;
  }

  .activity-grid {
    grid-template-columns: 1fr;
  }
}
</style>
