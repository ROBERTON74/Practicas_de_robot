<template>
  <div class="container-fluid d-flex flex-column justify-content-start align-items-center vh-100">
    <div class="row" style="width: 450px; margin-top: 50px;">
      <div class="logo mb-5">
        <img class="mb-3" src="/images/VR-ISA.png" />
        <h1 class="mb-3">Laboratorios Virtuales y Remotos</h1>
        <h3 class="mb-3">UCM - DACYA</h3>
      </div>

      <form class="mx-auto" id="login" v-on:submit="submit">
        <div class="row mb-3">
          <label for="username" class="visually-hidden">Usuario:</label>
          <div class="input-group">
            <div class="btn"><i class="bi bi-person align-midle"></i></div>
            <input class="form-control" v-model="username" type="text" name="username" placeholder="Usuario"
              id="username" required autofocus>
          </div>
        </div>

        <div class="row mb-5">
          <label for="password" class="visually-hidden">Contraseña:</label>
          <div class="input-group">
            <div class="btn"><i class="bi bi-key"></i></div>
            <input v-model="password" type="password" name="password" placeholder="Contraseña" id="password"
              class="form-control">
          </div>
        </div>

        <button type="submit" class="form-control btn btn-primary" value="Submit">Entrar</button>
      </form>
      <div v-if="error.message.length > 0" class="alert alert-warning mt-3" role="alert">{{ error.message }}</div>
    </div>
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
    .then((user) => {
      router.push('/home');
    })
    .catch((e) => {
      error.message = e.message;
    });
}

onBeforeRouteUpdate(async (to, from) => {
  await vm.session.authenticate().catch((error) => { });
});
</script>