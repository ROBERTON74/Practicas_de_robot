<template>
  <div>
    <nav-bar v-if="showNavBar"></nav-bar>
    <router-view></router-view>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import { computed, provide, reactive } from 'vue'
import { useRoute } from 'vue-router';

const route = useRoute();
const showNavBar = computed(() => route.path != '/');
const props = defineProps([ 'session' ]);
provide('session', reactive(props.session));
</script>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Montserrat, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}

html {
  background-size: cover;
  margin: 0;
  padding: 0;
}
</style>