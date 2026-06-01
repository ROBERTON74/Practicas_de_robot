<template>
  <div class="app-shell">
    <nav-bar v-if="showNavBar"></nav-bar>
    <main :class="{ 'app-main': showNavBar }">
      <router-view></router-view>
    </main>
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
:root {
  --vrisa-ink: #182230;
  --vrisa-muted: #667085;
  --vrisa-line: #d9e2ec;
  --vrisa-panel: #ffffff;
  --vrisa-soft: #f4f7fb;
  --vrisa-primary: #0f766e;
  --vrisa-primary-dark: #134e4a;
  --vrisa-accent: #2563eb;
  --vrisa-danger: #c2410c;
  --vrisa-shadow: 0 16px 40px rgba(24, 34, 48, 0.1);
}

* {
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  margin: 0;
  background: linear-gradient(180deg, #f4f7fb, #e8eff7);
}

#app {
  font-family: Montserrat, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--vrisa-ink);
  margin-top: 0px;
}

.app-shell {
  min-height: 100vh;
}

.app-main {
  width: 100%;
  margin: 0;
  padding: 18px 24px 32px;
}

html {
  background-size: cover;
  margin: 0;
  padding: 0;
}

.vr-page-title {
  font-size: clamp(1.5rem, 2.4vw, 2.2rem);
  font-weight: 700;
  color: var(--vrisa-ink);
  margin: 0;
}

.vr-eyebrow {
  color: var(--vrisa-primary);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.vr-panel {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(217, 226, 236, 0.92);
  border-radius: 8px;
  box-shadow: var(--vrisa-shadow);
}

.btn-primary,
.btn-success {
  background: var(--vrisa-primary);
  border-color: var(--vrisa-primary);
}

.btn-primary:hover,
.btn-success:hover {
  background: var(--vrisa-primary-dark);
  border-color: var(--vrisa-primary-dark);
}

.btn-outline-success {
  color: var(--vrisa-primary);
  border-color: var(--vrisa-primary);
}

.btn-outline-success:hover {
  background: var(--vrisa-primary);
  border-color: var(--vrisa-primary);
}

@media (max-width: 768px) {
  .app-main {
    padding: 12px 10px 28px;
  }
}
</style>
