// Configuración del modelo del laboratorio.
// Define todas las variables que existen en el sistema, divididas en dos grupos:
//   - writables: variables que el alumno puede controlar (se ENVÍAN al robot)
//   - readables: variables que el robot devuelve (se RECIBEN del servidor)
const model = {
  // Variables que el usuario puede modificar desde la interfaz (entradas al robot)
  writables: {
    // Tipo de señal a generar: senoidal, cuadrada, triangular, etc.
    Tipo: {
      name: 'Tipo',
      description: 'Amplitud de la señal a generar',
      type: 'set',
      choices: [
        'Senoidal',
        'Cuadrada',
        'Triangular',
        'Impulse',
        'Step',
        'Extern',
      ],
      value: 'Senoidal',
      new_value: 'Senoidal',
    },
    // Altura de la señal generada, entre -12V y +12V
    Amplitud: {
      name: 'Amplitud',
      description: 'Amplitud de la señal a generar',
      type: 'float',
      min: '-12',
      max: '+12',
      precision: '0.01',
      value: 0,
      new_value: 0,
    },
    // Duración de un ciclo completo de la señal (en segundos)
    Periodo: {
      name: 'Periodo',
      description: 'Periodo de la señal a generar',
      type: 'float',
      min: '0.02',
      max: 'Inf',
      precision: '0.01',
      value: 0,
      new_value: 0,
    },
    // Desplazamiento vertical de la señal (sube o baja la señal en el eje Y)
    'Offset Y': {
      name: 'Offset Y',
      description: 'Desviación en amplitud de la señal generar',
      type: 'float',
      min: '0',
      max: 'Inf',
      precision: '0',
      value: 0,
      new_value: 0,
    },
    // Desplazamiento horizontal de la señal (la mueve en el eje del tiempo)
    'Offset T': {
      name: 'Offset T',
      description: 'Desviación en el tiempo de la señal a generar',
      type: 'float',
      min: '0',
      max: 'Inf',
      precision: '0',
      value: 0,
      new_value: 0,
    },
  },

  // Variables que llegan desde el servidor con los datos del laboratorio (salidas del robot)
  readables: {
    // Tiempo del servidor en segundos desde que arrancó el experimento
    time: {
      name: 'Tiempo',
      description: 'Tiempo del servidor en segundos desde el inicio.',
      type: 'float',
      min: '0',
      max: 'Inf',
      precision: '0.001',
      value: 0,
      new_value: 0,
    },
    // Señal de referencia que entra al circuito (lo que se le pide al sistema)
    ref: {
      name: 'Referencia',
      description: 'Referencia de entrada al circuito.',
      type: 'float',
      min: '-12',
      max: '+12',
      precision: '0.01',
      value: 0,
      new_value: 0,
    },
    // Acción de control: lo que el controlador ordena al actuador
    u: {
      name: 'Variable manipulada',
      description: 'Acción de control ',
      type: 'float',
      min: -12,
      max: 11,
      precision: '0.01',
      value: 0,
      new_value: 0,
    },
    // Salida real del circuito: lo que ocurre físicamente en el laboratorio
    y: {
      name: 'Variable controlada',
      description: 'Salida del circuito',
      type: 'float',
      min: '0',
      max: 'Inf',
      precision: '0',
      value: 0,
      new_value: 0,
    },
  },
};

// Clase auxiliar para gestionar el estado local de las variables del laboratorio.
// NOTA: Esta clase está incompleta y no se usa — ver LabInstance más abajo.
class LabState {
  // Crea un LabState a partir del modelo, recorriendo controles y señales
  static fromModel(model) {
    const state = new LabState();
    for (const [w, w_info] of Object.entries(model[LabState.CONTROLS])) {
      state.add(w, w_info);
    }
    for (const [w, w_info] of Object.entries(model[LabState.SIGNALS])) {
      state.add(w, w_info);
    }
    return state;
  }

  constructor(session) {
    this.CONTROLS = 'writable';
    this.SIGNALS = 'readable';
    this.state = {};        // estado local de cada variable
    this.state_server = {}; // estado recibido del servidor
    this.events = { any: [] };
  }

  // Añade una variable al estado local con su valor inicial
  add(name, model) {
    if (type !== this.READABLE && type !== this.WRITABLE) {
      throw new Error(`Unsupported type ${type}`);
    }
    this.state[name] = {
      value: model.value,
      new_value: model.value,
      last_update: null,
      changed: false,
    };
  }

  // Devuelve el valor actual de una variable como Promise
  get(name) {
    if (!name in this.READABLE) {
      throw new Error(`"${name}" does not exist.`);
    }
    return Promise.resolve(this.state[name].value);
  }

  // Marca una variable como modificada con el nuevo valor pendiente de enviar
  set(name, value) {
    this.state[name].new_value = value;
    this.state[name].changed = true;
  }

  // Registra una función callback que se llama cuando ocurre cualquier evento
  register(callback, events) {
    if (!events || events != 'any') {
      throw new Error('Yet to be implemented');
    }
    if (this.events.any.includes(callback)) {
      throw new Error(`${callback} already registered.`);
    }
    this.events.any.push(callback);
  }

  // Devuelve el estado completo como objeto plano (para enviarlo al servidor)
  serialize() {
    return this.state;
  }
}

// Código de ejemplo comentado — muestra cómo se usaría LabState si estuviera terminado
// const labmodel = LabState.fromModel(model);
// labmodel.register((update) => {
//   console.log(update);
// }, 'any');

// labmodel
//   .set('Amplitud', 3)
//   .then((updated) => {
//     console.log(updated);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// Clase principal que gestiona la conexión en tiempo real con el servidor ReNoLabs.
// Usa Socket.IO (WebSockets) para enviar y recibir señales del laboratorio.
// Estados posibles: idle → connected → disconnecting → idle
class LabInstance {
  // address: dirección del servidor (ej: 'localhost')
  // port: puerto del servidor (ej: 8080)
  // handlers: objeto con callbacks opcionales (onconfig, onsignals, disconnect)
  constructor(address, port, handlers) {
    this.address = address;
    this.port = port;
    this.handlers = handlers;
    this.state = 'idle';      // estado actual de la conexión
    this.connecting = null;
    this.state_client = { inputs: {}, outputs: {} };  // lo que hemos enviado al lab
    this.state_server = { config: 1, evolution: [], inputs: {}, outputs: {} }; //[0: disconnected, 1: ready, 2: play, 3: pause, 4: reset]
    this.buffer = [];       // acumulador temporal de datos entre notificaciones
    this.listeners = [];    // funciones suscritas a actualizaciones de señales
    this.events = { any: [] };
    // Legacy version, will be removed
    this.state_EJS = this.state_client;
    this.state_REAL = this.state_server;
  }

  //this.socket.on(
  //  'disconnect_timeout',
  //  this._ondisconnecttimeout.bind(this)
  //);

  /**
   * Open a new connection with the remote laboratory server.
   */
  // Abre la conexión WebSocket con el servidor.
  // Al conectar, pide la configuración del lab (signals.info).
  // Registra los eventos de conexión, error, desconexión y recepción de señales.
  connect() {
    return this._transition(
      'connected',
      ['idle', 'disconnecting'],
      (resolve, reject) => {
        const doConnect = () => {
          this.socket.emit('signals.info', {
            request: 'config',
          });
          resolve();
        };
        this.socket = this._createSocket();
        this.socket.on('connect', () => doConnect());
        this.socket.on('login_error', (reason) => reject(reason));
        this.socket.on('connect_error', (reason) => reject(reason));
        this.socket.on('disconnect', this._ondisconnect.bind(this));
        this.socket.on('signals.get', this._onsignals.bind(this));
        // DEPRECATED: will be removed {
        this.socket.on('signals.info', this._onconfig.bind(this));
        // }
        this.socket.connect();
      }
    );
  }

  // Máquina de estados: garantiza que solo se permiten transiciones válidas.
  // Si el estado actual no está en `guard`, rechaza con un error.
  _transition(state, guard, action) {
    if (!guard.includes(this.state)) {
      return Promise.reject(
        new Error(`Invalid transition ${this.state} -> ${state}`)
      );
    }

    const doTransition = (data) => {
      this.state = state;
      return Promise.resolve(data);
    };
    return action ? new Promise(action).then(doTransition) : doTransition();
  }

  // Crea el socket de Socket.IO con la URL y el token de autenticación.
  // autoConnect: false para controlar manualmente cuándo conectar.
  _createSocket() {
    const socket = io(this._getURL(), {
      query: this._getQueryString(),
      autoConnect: false,
      reconnection: false,
    });
    return socket;
  }

  // Obtiene la URL del servidor.
  // Primero intenta usar la variable global LAB_ADDRESS (definida por la página del lab).
  // Si no existe, construye la URL con address y port.
  _getURL() {
    let url;
    try {
      url = parent.LAB_ADDRESS || LAB_ADDRESS;
    } catch (e) {
      url = Number.isInteger(this.port) ? `http://${this.address}:${this.port}` : `http://${this.address}/`;
    }
    return url;
  }

  // Construye el query string de autenticación: token JWT + actividad actual
  _getQueryString() {
    return `key=${this.token}&activity=${this._getActivity()}`;
  }

  // Obtiene el identificador de la actividad actual del laboratorio.
  // Primero busca la variable global LAB_ACTIVITY (definida por la página del lab).
  _getActivity() {
    try {
      return parent.LAB_ACTIVITY || LAB_ACTIVITY;
    } catch (e) {
      return this.activity;
    }
  }

  // Lee el token JWT de la cookie del navegador llamada 'activityToken'.
  // Este token lo genera el servidor al autenticar al alumno.
  get token() {
    return document.cookie.replace(
      /(?:(?:^|.*;\s*)activityToken\s*\=\s*([^;]*).*$)|^.*$/,
      '$1'
    );
  }

  /**
   * Disconnect from the lab.
   */
  // Maneja la desconexión inesperada del servidor.
  // Vuelve al estado 'idle' y llama al handler de desconexión si existe.
  _ondisconnect(reason) {
    this._transition('idle', ['connected', 'disconnecting']).then(() => {
      this.socket.off();
      if (this.handlers && this.handlers.disconnect) {
        this.handlers.ondisconnect(reason);
      }
    });
  }

  /**
   * Receive signals data.
   */
  // Se ejecuta cada vez que el servidor envía datos nuevos del laboratorio.
  // Actualiza state_server con los valores recibidos y notifica a todos los listeners.
  // Si la variable es 'evolution', acumula los datos en el buffer histórico.
  _onsignals(data) {
    const updated = {};
    if (!Array.isArray(data)) {
      data = [data];
    }
    for (var i = 0; i < data.length; i++) {
      const state = data[i];
      if (state['variable'] == 'evolution') {
        this.buffer.push(state['value']);
      }
      this.state_server[state.variable] = state.value;
      updated[state.variable] = true;
    }
    // const eventsCount = {};
    // for (const [k, v] of Object.entries(this.state_server)) {
    //   eventsCount[k] = v.length;
    // }
    // Notifica a todos los listeners suscritos con el historial y el estado actual
    this.listeners.forEach((l) => {
      l.invoked = true;
      l.callback({
        history: this.buffer,
        state: this.state_server,
      });
    });
    // this.listeners = this.listeners.filter((l) => l.oneTime && l.invoked);
    if (this.handlers && this.handlers.onsignals) {
      this.handlers.onsignals({
        history: this.buffer,
        state: this.state_server,
      });
    }
    this.buffer = [];
  }

  /**
   * @deprecated
   * Receive the configuration metadata.
   */
  // Recibe la configuración del laboratorio al conectarse (nombre de señales, rangos, etc.).
  // Marcado como deprecated: se eliminará en versiones futuras.
  _onconfig(data) {
    if (data.request == 'config') {
      this.config = data.response;
      this.configNo++;
    }
    if (this.handlers && this.handlers.onconfig) {
      this.handlers.onconfig(data);
    }
  }

  /**
   * Disconnect from the lab.
   */
  // Cierra la conexión con el servidor de forma controlada.
  disconnect() {
    return this._transition('disconnecting', ['connected']).then(() => {
      this.socket.disconnect();
    });
  }

  // Muestra un aviso al alumno cuando su sesión expira y redirige al inicio.
  _ondisconnecttimeout(data) {
    alert('Aviso: La sesión ha finalizado.');
    window.location = './home';
  }

  // Devuelve true si la conexión está inactiva (no conectado)
  get idle() {
    return this.state == 'idle';
  }

  // Devuelve true si se está cerrando la conexión
  get disconnecting() {
    return this.state == 'disconnecting';
  }

  // Devuelve true si hay conexión activa con el servidor
  get connected() {
    return this.state == 'connected';
  }

  // Envía nuevos valores de señales al servidor del laboratorio.
  // updates: array de objetos { nombreSeñal: valor }
  // Ejemplo: lab.set([{ Amplitud: 5 }, { Tipo: 'Cuadrada' }])
  set(updates) {
    const events = [];
    updates.forEach((u) => {
      for (const [signal, value] of Object.entries(u)) {
        events.push({
          variable: signal,
          value,
        });
      }
    });
    this.socket.emit('signals.set', events);
  }

  // Registra una función callback que se llama cada vez que llegan datos del laboratorio.
  // Usado por Vue.js para actualizar la pantalla automáticamente con los datos en tiempo real.
  register(callback, events) {
    if (!events || events != 'any') {
      throw new Error('Yet to be implemented');
    }
    if (this.events.any.includes(callback)) {
      throw new Error(`${callback} already registered.`);
    }
    this.listeners.push({ callback, invoked: false, oneTime: false });
  }

  // Envía eventos directamente al socket sin transformación.
  // Alternativa de bajo nivel a set() para casos especiales.
  send(events) {
    this.socket.emit("signals.set", events);
  }
}

export { LabInstance };
