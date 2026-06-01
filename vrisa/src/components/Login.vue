<template>
  <div class="login-page">
    <section class="login-visual">
      <img class="login-photo" src="/vr-isa/images/vrlabs/front.jpg" alt="" aria-hidden="true">
      <div class="login-copy">
        <span class="vr-eyebrow">Universidad Complutense de Madrid</span>
        <h1>Laboratorios virtuales y remotos</h1>
        <p>Acceso a practicas de robotica, control y sistemas experimentales desde una interfaz renovada.</p>
      </div>
    </section>

    <section class="login-panel vr-panel">
      <div class="logo mb-4">
        <img class="mb-3" src="/vr-isa/images/VR-ISA.png" />
        <h2>VR-ISA Labs</h2>
        <p>UCM - DACYA</p>
      </div>

      <form id="login" v-on:submit="submit">
        <div class="mb-3">
          <label for="username" class="visually-hidden">Usuario:</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-person align-midle"></i></span>
            <input class="form-control" v-model="username" type="text" name="username" placeholder="Usuario"
              id="username" required autofocus>
          </div>
        </div>

        <div class="mb-4">
          <label for="password" class="visually-hidden">Contrasena:</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-key"></i></span>
            <input v-model="password" type="password" name="password" placeholder="Contrasena" id="password"
              class="form-control">
          </div>
        </div>

        <button type="submit" class="w-100 btn btn-primary btn-lg" value="Submit">Entrar</button>
      </form>
      <div v-if="error.message.length > 0" class="alert alert-warning mt-3" role="alert">{{ error.message }}</div>
    </section>
  </div>
</template>

<script setup>
import { inject, reactive } from 'vue';
import { onBeforeRouteUpdate, useRouter } from 'vue-router';

const router = useRouter();
const session = inject('session');

const error = reactive({ 'message': '' });
let username = '';
let password = '';

function submit(ev) {
  ev.preventDefault();
  session
    .login(username, password)
    .then(() => {
      router.push('/home');
    })
    .catch((e) => {
      error.message = e.message;
    });
}

onBeforeRouteUpdate(async () => {
  await session.authenticate().catch(() => { });
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  align-items: stretch;
}

.login-visual {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: flex-end;
  padding: 64px;
  background: #0f172a;
  color: #fff;
  overflow: hidden;
}

.login-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.58;
}

.login-copy {
  position: relative;
  z-index: 1;
  width: min(720px, 100%);
}

.login-copy h1 {
  margin: 12px 0 16px;
  font-size: clamp(2.1rem, 5vw, 4.8rem);
  font-weight: 700;
  line-height: 1;
}

.login-copy p {
  max-width: 650px;
  color: rgba(255, 255, 255, 0.84);
  font-size: 1.08rem;
}

.login-panel {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 0;
  padding: 48px;
  box-shadow: -20px 0 50px rgba(15, 23, 42, 0.12);
}

.logo {
  text-align: left;
}

.logo img {
  width: min(210px, 100%);
}

.logo h2 {
  margin: 0;
  color: var(--vrisa-ink);
  font-size: 1.8rem;
  font-weight: 700;
}

.logo p {
  margin: 6px 0 0;
  color: var(--vrisa-muted);
  font-weight: 700;
}

.input-group-text {
  color: var(--vrisa-primary);
  background: #ecfdf5;
  border-color: var(--vrisa-line);
}

.form-control {
  min-height: 46px;
  border-color: var(--vrisa-line);
}

@media (max-width: 900px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .login-visual {
    min-height: 38vh;
    padding: 36px 24px;
  }

  .login-panel {
    min-height: auto;
    padding: 34px 24px;
  }
}
</style>
