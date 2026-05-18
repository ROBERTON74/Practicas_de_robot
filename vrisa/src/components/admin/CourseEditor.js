<template>
  <div>
    <form>
      <div class="row mb-3">
        <div class="col-md-2"><label for="name" class="col-form-label">Nombre del curso:</label></div>
        <div class="col-md-10"><input type="text" class="form-control" name="name" v-model="course"></div>
      </div>
      <div class="row mb-3">
        <div class="col-md-2"><label for="year" class="col-form-label">Curso Académico:</label></div>
        <div class="col-md-10"><input type="text" class="form-control" name="year" v-model="year"></div>
      </div>
      <div class="row mb-3">
        <div class="col-md-2"><label for="name" class="col-form-label">Alumnos:</label></div>
        <div class="col-md-10"><input type="file" class="form-control" name="students"
            @input="event => students = event.target"></div>
      </div>
      <div class="row mb-3">
        <input type="button" class="btn btn-success" v-on:click="submit">SUBMIT</input>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      columns: ['Nombre', 'Curso'],
      fields: [
        { 'key': 'name', 'strong': true },
        { 'key': 'year', 'strong': true },
      ],
      model: [],
      model_name: 'course',
      title: 'Cursos disponibles',
      students: '',
      query: {},
      form: {},
      course: '',
      year: '',
    }
  },

  methods: {
    submit: function () {
      this.query = {
        'model': this.model,
        'action': 'add',
        'data': { 'name': this.course, 'year': this.year }
      }
      post(`/admin/q/${this.model_name}/add`,
        JSON.stringify(this.query),
        result => {
          this.model = result;
          console.log(result)
        },
        error => {
          showMessage(`Cannot load ${this.model_name} from server.`, 'modalGenericMessage');
        }
      )
    },


    submit() {
      const [file] = this.students.files;
      if (file) {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          this.query.data[''] = reader.result;
          post(`/admin/q/${this.model_name}/add`,
            JSON.stringify({ 'data': this.form }),
            result => { this.model = result; },
            error => {
              showMessage(`Cannot load ${this.model_name} from server.`, 'modalGenericMessage');
            }
          )
        });
        reader.readAsDataURL(file);
      }
    },


    fields_value(row, key) {
      var f = {
        'View': (o) => { return o.View ? o.View.createdAt.toLocaleString() : "La más reciente" },
        'Controller': (o) => { return o.Controller ? o.Controller.createdAt.toLocaleString() : "La más reciente" }
      }
      return (key in f) ? f[key](row) : row[key];
    },

    reloadActivities() {
      post(`/admin/q/${this.model_name}/get`,
        JSON.stringify(this.query),
        result => { this.model = result; },
        error => {
          showMessage(`Cannot load ${this.model_name} from server.`, 'modalGenericMessage');
        }
      )
    },

    remove(entity) {
      post(`/admin/q/${this.model_name}/delete`,
        JSON.stringify({ 'where': { 'id': entity.id } }),
        result => {
          console.log(result)
        },
        error => {
          showMessage(`Cannot load ${this.model_name} from server.`, 'modalGenericMessage');
        }
      )
    },

    edit(entity) {
      // post(`/admin/q/${this.model_name}/delete`,
      //   JSON.stringify({ 'where': { 'id': entity.id }}),
      //   result => {
      //     console.log(result)
      //   },
      //   error => {
      //     showMessage(`Cannot load ${this.model_name} from server.`, 'modalGenericMessage');
      //   }
      // )
    }
  },

  mounted() {
    this.reloadActivities();
  }
}
</script>
