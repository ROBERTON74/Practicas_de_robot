<template>
  <div class="container justify-content-center" style="margin-top: 100px">
    <div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
      <div class="col" v-for="item in model" :key="item.name">
        <div class="card  mb-3">
          <div class="card-header">
            <h4>{{ item.name }}</h4>
          </div>
          <div class="card-body">
            <p align="center">
              <router-link :to="item.path" class="btn btn-outline-primary">
                <i :class="item.icon" style="font-size: 5rem;"></i>
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'

const model = [
  { name: 'Actividades', icon: 'bi bi-tools', path: '/admin/activity' },
  { name: 'Vista', icon: 'bi bi-tv', path: '/admin/view' },
  { name: 'Controlador', icon: 'bi bi-cpu', path: '/admin/controller' },
  { name: 'Usuarios', icon: 'bi bi-people', path: '/admin/users' },
  { name: 'Cursos', icon: 'bi bi-wrench', path: '/admin/courses' },
];
</script>