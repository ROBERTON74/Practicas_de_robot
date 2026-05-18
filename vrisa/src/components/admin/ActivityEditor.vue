<template>
  <edition-panel>
    <div class="container d-flex flex-column overflow-scroll">
      <div class="container-fluid d-flex">
        <div class="container d-flex flex-column">
          <label for="users_allowed">Usuarios con acceso a la actividad:</label>
          <select class="form-select" multiple size="20" name="users_allowed" id="users_allowed">
            <option v-for="u in usersAllowed" :key="u.username" value="u.username">{{ u.displayName }}</option>
          </select>
        </div>

        <div class="d-flex flex-column justify-content-center">
          <button class="btn"><i @click="addUsers()" class="bi bi-arrow-left-circle"></i></button>
          <button class="btn"><i @click="removeUsers()" class="bi bi-arrow-right-circle"></i></button>
        </div>

        <div class="container d-flex flex-column">
          <label for="users_not_allowed">Usuarios sin acceso a la actividad:</label>
          <select class="form-select" multiple size="20" name="users_not_allowed" id="users_not_allowed">
            <option v-for="u in usersNotAllowed" :key="u.username" value="u.username">{{ u.displayName }}</option>
          </select>
        </div>
      </div>
    </div>
  </edition-panel>

</template>

<script setup>
import EditionPanel from '@/components/admin/EditionPanel.vue'
import { onMounted } from 'vue'

const usersAllowed = [];
const usersNotAllowed = [];

function reload() {
  // let model = 'user';
  // let query = {
  //   include: 'activity',
  // };
  // post(
  //   `/admin/q/${model}/get`,
  //   JSON.stringify(query),
  //   (result) => {
  //     this.usersNotAllowed = result;
  //   },
  //   (error) => {
  //     showMessage(`Cannot load users from server.`, 'modalGenericMessage');
  //   }
  // );
}

function addUsers(users) {
  console.log('aaa');
}

function removeUsers(users) {
  console.log('dddd');
}

onMounted(() => {
  reload();
})
</script>