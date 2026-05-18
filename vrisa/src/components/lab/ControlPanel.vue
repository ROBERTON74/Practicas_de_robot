<template>
  <div class="card">
    <div class="card-header">
      <h5 class="text-center fw-bold">{{ controls.title }}</h5>
    </div>
    <div v-for="i in controls.elements" class="form-row mb-1">
      <div class="col">
        <label class="form-label align-middle fw-bold">{{ controllerModel.writables[i].name }}</label>
      </div>
      <div class="form-row">
        <div class="d-flex">
          <select v-bind:class="style(controllerModel.writables[i])" v-if="controllerModel.writables[i].type == 'set'"
            class="form-control form-control-sm mx-3" v-model="controllerModel.writables[i].new_value">
            <option v-for="o, j in controllerModel.writables[i].choices" :value="j">{{ o }}</option>
          </select>
          <input v-bind:class="style(controllerModel.writables[i])" v-if="controllerModel.writables[i].type != 'set'"
            type="text" class="form-control form-control-sm mx-3" data-bs-toggle="tooltip" data-bs-placement="top"
            :title="controllerModel.writables[i].description" v-model="controllerModel.writables[i].new_value">
          <button @click="set(i)" class="btn btn-success btn-sm"><i class="bi bi-arrow-right"></i></button>
          <select v-if="controllerModel.writables[i].type == 'set'" class="form-control form-control-sm  mx-3"
            v-model="controllerModel.writables[i].value">
            <option v-for="o, j in controllerModel.writables[i].choices" :value="j">{{ o }}</option>
          </select>
          <input v-if="controllerModel.writables[i].type != 'set'" type="text" class="form-control form-control-sm mx-3"
            :value=controllerModel.writables[i].value disabled>
        </div>
        <div class="form-text">{{ controllerModel.writables[i].description }}</div>
      </div>
    </div>
    <div class="card-body">
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue' 
import { LabInstance } from '@/assets/LabControl.js';

const props = defineProps({
  controls: Object,
  controllerModel: Object,
  labcontrol: LabInstance,
});

function element(o, i, k) {
  return o[i][k];
}

function style(control) {
  return { 'mx-3': true, 'bg-warning': !this.synced(control) };
}

function synced(control) {
  return control.value == control.new_value;
}

function set(control) {
  const values = props.controls.elements.map((name) =>
    parseFloat(props.controllerModel.writables[name][(name == control) ? 'new_value' : 'value'])
  );
  const update = {};
  update[props.controls.name] = values;
  props.labcontrol.set([update]);
}

function onsignals(data) {
  for (var i in data.state[props.controls.name]) {
    props.controllerModel.writables[props.controls.elements[i]].value = data.state[props.controls.name][i];
  }
}

onMounted(() => {
  // state = props.controls.elements.map((c) => parseFloat(props.controllerModel.writables[c].value))
  props.labcontrol.register(onsignals, 'any');
});
</script>