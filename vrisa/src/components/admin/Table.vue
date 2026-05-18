<template>
  <edition-panel>
    <div class="table-responsive">
      <table class="table table-sm table-striped table-hover table-bordered caption-top" id="viewsTable">
        <caption>{{ title }}</caption>
        <thead>
          <tr>
            <th class="align-middle" scope="col"><input type="checkbox" /></th>
            <th class="align-middle" scope="col"></th>
            <th class="align-middle" scope="col"></th>
            <template v-for="c in columns">
              <th class="align-middle" scope="col">{{ c }}</th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in entries" :key="v.id">
            <td class="align-middle"><input type="checkbox" /></td>
            <td class="align-middle"><i @click="edit(v.name)" class="bi bi-pencil" style="cursor:pointer"></i></td>
            <td class="align-middle"><i @click="remove(v.name)" class="bi bi-trash" style="cursor:pointer"></i></td>
            <template v-for="f in fields">
              <th v-if="f['strong']" class="align-middle" scope="row">{{ fields_value(v, f['key']) }}</th>
              <td v-else class="align-middle">{{ fields_value(v, f['key']) }}</td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </edition-panel>
</template>

<script setup>
import EditionPanel from '@/components/admin/EditionPanel.vue';
import NavBar from '@/components/NavBar.vue';
import { inject, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';

const session = inject('session');
const props = defineProps(['title', 'columns', 'fields', 'fields_display', 'model_name']);
const entries = reactive([]);
var query = {};
const router = useRouter();

function fields_value(row, key) {
  return props.fields_display && key in props.fields_display
    ? props.fields_display[key](row)
    : row[key];
};

function edit(name) {
  router.push(`/${props.model_name}/${name}`);
}

function reload() {
  session.query(`${props.model_name}/get`, props.query)
    .then(response => response.json())
    .then(result => Object.assign(entries, result))
    .catch((error) => {
      console.log(error);
    });
}

onMounted(() => { reload(); });
</script>