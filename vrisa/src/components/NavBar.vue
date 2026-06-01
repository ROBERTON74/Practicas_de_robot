<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark modern-navbar">
      <div class="container-fluid">
        <router-link to="/home" class="navbar-brand d-flex align-items-center gap-2">
          <span class="brand-mark">
            <img width="32" height="32" src="/vr-isa/images/VR-ISA-sm.png" />
          </span>
          <span class="brand-text">
            <strong>VR-ISA Labs</strong>
            <small>Laboratorios remotos</small>
          </span>
        </router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item text-light">
              <router-link class="nav-link" to="/home"><i class="mx-1 bi bi-hammer"></i>Actividades</router-link>
            </li>
            <li v-if="isProfessor" class="nav-item text-light">
              <router-link class="nav-link" to="/stats"><i class="mx-1 bi bi-bar-chart"></i>Estadisticas</router-link>
            </li>
            <li v-if="isAdmin" class="nav-item text-light">
              <router-link class="nav-link" to="/admin"><i class="mx-1 bi bi-gear"></i>Administracion</router-link>
            </li>
          </ul>
          <div class="dropdown">
            <button class="btn session-button dropdown-toggle" type="button" id="session"
              data-bs-toggle="dropdown" aria-expanded="false">
              {{ displayName }}
              <img class="mx-2 user-avatar" src="/vr-isa/images/user_icon.png" width="36" height="36" />
            </button>
            <ul class="dropdown-menu" aria-labelledby="session">
              <li><router-link to="/" @click="session.logout"
                  class="dropdown-item fw-bold btn btn-danger btn-outline">Cerrar sesion</router-link></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';

const session = inject('session');
const isAdmin = computed(() => session.user && session.user.isAdmin);
const isProfessor = computed(() => session.user && session.user.isProfessor);
const displayName = computed(() => session.user && session.user.displayName);
</script>

<style scoped>
.modern-navbar {
  min-height: 68px;
  padding: 0 18px;
  background: rgba(15, 23, 42, 0.94);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.18);
}

.navbar-brand {
  color: #fff;
}

.brand-mark {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
}

.brand-text small {
  margin-top: 4px;
  color: #a7f3d0;
  font-size: 0.72rem;
  font-weight: 600;
}

.navbar-nav .nav-link {
  color: rgba(255, 255, 255, 0.76);
  border-radius: 6px;
  margin: 0 2px;
  padding: 10px 14px;
  font-weight: 700;
}

.navbar-nav .nav-link:hover,
.navbar-nav .router-link-active {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.session-button {
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.08);
}

.session-button:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.14);
}

.user-avatar {
  background: #e0f2fe;
  border-radius: 8px;
  padding: 3px;
}
</style>
