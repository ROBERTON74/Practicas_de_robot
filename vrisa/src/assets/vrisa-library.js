export const ActivityModel = {
  title: 'Actividades disponibles',
  model_name: 'activity',
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
  fields_display: {
    View: (o) => {
      return o.View ? o.View.createdAt.toLocaleString() : 'La más reciente';
    },
    Controller: (o) => {
      return o.Controller
        ? o.Controller.createdAt.toLocaleString()
        : 'La más reciente';
    },
  },
};

export const ViewModel = {
  title: 'Vistas disponibles',
  model_name: 'view',
  columns: ['Nombre', 'Fecha', 'Id', 'Ruta Principal', 'Ruta Descripcion'],
  fields: [
    { key: 'name', strong: true },
    { key: 'createdAt', strong: true },
    { key: 'id', strong: false },
    { key: 'path', strong: false },
    { key: 'description', strong: false },
  ],
};

export const ControllerModel = {
  title: 'Controladores disponibles',
  model_name: 'controller',
  columns: ['Nombre', 'Fecha', 'Lenguaje', 'Ruta', 'Id'],
  fields: [
    { key: 'name', strong: true },
    { key: 'createdAt', strong: true },
    { key: 'type', strong: false },
    { key: 'path', strong: false },
    { key: 'id', strong: false },
  ],
};

export const UserModel = {
  title: 'Usuarios disponibles',
  model_name: 'user',
  columns: ['Usuario', 'Nombre Completo', 'Contraseña', 'Correo', 'Permisos'],
  fields: [
    { key: 'username', strong: true },
    { key: 'displayName', strong: false },
    { key: 'password', strong: false },
    { key: 'emails', strong: false },
    { key: 'permissions', strong: false },
  ],
};

export const CourseModel = {
  title: 'Cursos disponibles',
  model_name: 'course',
  columns: ['Nombre', 'Curso'],
  fields: [
    { key: 'name', strong: true },
    { key: 'year', strong: true },
  ],
};

const ExperimentModel = {
  title: 'Experimentos disponibles',
  model_name: 'course',
  columns: ['Nombre', 'Curso'],
  fields: [
    { key: 'name', strong: true },
    { key: 'name', strong: true },
    { key: 'year', strong: true },
    { key: 'name', strong: true },
  ],
};

export class User {
  constructor(token) {
    this.username = token.username;
    this.displayName = token.displayName;
    this.role = token.role;
  }

  get isAdmin() {
    return this.role == 'admin';
  }

  get isProfessor() {
    return this.role == 'admin' || this.role == 'professor';
  }

  get activities() {}
}

export class Session {
  constructor(server) {
    this._authenticated = false;
    this.server = server || 'http://localhost/api/';
  }

  decode(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  }

  login(username, password) {
    return fetch(`${this.server}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then(async (response) => {
        if (response.status != 200) {
          throw new Error('Usuario o contraseña incorrecta');
        }
        const result = await response.json();
        this.accessToken = result.accessToken;
        this.authenticated = true;
        return this.user;
      })
      .catch((error) => {
        this.authenticated = false;
        throw error;
      });
  }

  logout() {
    $cookies.remove('accessToken');
    $cookies.remove('activityToken');
  }

  authenticate() {
    return fetch(`${this.server}/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken: this.accessToken }),
    })
      .then((response) => {
        if (response.status != 200) {
          throw new Error('Unauthorized');
        }
        this.authenticated = true;
        return this.user;
      })
      .catch((error) => {
        this.authenticated = false;
        this.accessToken = null;
        throw error;
      });
  }

  get(url) {
    return fetch(`${this.server}${url}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
  }

  query(action, data) {
    // const actions = ['get'];
    // if (actions.includes(action)) {
    //   throw new Error('Invalid action');
    // }
    return this.post(`/admin/q/${action}`, data);
  }

  post(url, body) {
    let data = { accessToken: this.accessToken };
    Object.assign(data, body);
    return fetch(`${this.server}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  start(activity) {
    return this.get(`/request_activity?name=${activity}`).then(
      async (response) => {
        const result = await response.json();
        this.activityToken = result.accessToken;
        return result;
      }
    );
  }

  getHelp(activity) {
    return this.get(
      `/help?name=${activity}&accessToken=${this.accessToken}`
    ).then((response) => response.text());
  }

  getHelpURL(activity) {
    return `${this.server}/help?name=${activity}&accessToken=${this.accessToken}`;
  }

  getRemoteURL(activity) {
    return `/remotelab?name=${activity}&accessToken=${this.activityToken}`;
  }

  getExperiments() {
    return this.post('/data')
      .then(async (response) => {
        const result = await response.json();
        return result.slice(0, 20).map((v) => {
          const date = new Date(v.date);
          return {
            name: v.name,
            date: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
            size: (v.size / 1000).toFixed(1) + ' kB',
          };
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  downloadExperiment(name) {
    return this.get(`/download/${name}?accessToken=${this.accessToken}`)
  }

  get authenticated() {
    return this._authenticated;
  }

  set authenticated(auth) {
    this._authenticated = auth;
  }

  get user() {
    const token = this.accessToken;
    if (!token || token == 'null') {
      return null;
    }
    return new User(this.decode(this.accessToken));
  }

  get activity() {
    const token = this.activityToken;
    if (!token || token == 'null') {
      return;
    }
    return this.decode(token);
  }

  get accessToken() {
    return $cookies.get('accessToken');
  }

  set accessToken(token) {
    if (!token) {
      $cookies.remove('accessToken');
    }
    $cookies.set('accessToken', token);
  }

  get activityToken() {
    return $cookies.get('activityToken');
  }

  set activityToken(token) {
    if (!token) {
      $cookies.remove('activityToken');
    }
    $cookies.set('activityToken', token);
  }
}


// export default {
//   Session,
//   ActivityModel,
//   ViewModel,
//   ControllerModel,
//   UserModel,
//   ExperimentModel,
//   CourseModel
// }
