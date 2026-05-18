<template>
  <div class="container-fluid">
    <slot></slot>
    <div class="d-flex justify-content-center" id="activitiesNavBar">
      <button @click="$router.go(-1)" class="btn btn-primary text-light mx-3 my-3">
        <i class="bi bi-arrow-left"></i>Atrás
      </button>
      <button @click="$router.go(1)" class="btn btn-primary text-light mx-3 my-3">
        <i class="bi bi-arrow-right"></i>Adelante
      </button>
      <button class="btn btn-success mx-3 my-3" data-bs-toggle="modal" data-bs-target="#modalActivity">
        Añadir actividad...
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      columns: [
        'Nombre',
        'Vista',
        'Versión de la Vista',
        'Controlador',
        'Versión del Controlador',
      ],
      fields: [
        { key: 'name', strong: true },
        { key: 'viewName', strong: true },
        { key: 'View', strong: false },
        { key: 'controllerName', strong: false },
        { key: 'Controller', strong: false },
      ],
      model: [],
      views: [],
      controllers: [],
      model_name: 'activity',
      query: { include: ['view', 'controller'] },
    };
  },
};
</script>
