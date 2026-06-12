const logger = require('winston').loggers.get('log');
var spawn = require('child_process').spawn;
const zmq = require('zeromq');

const Adapter = require('../Adapter');

/**
 * Encapsulates the interaction with the Dobot Server
 */
class DobotAdapter extends Adapter {
   constructor(controller, options) {
    super(controller, options);
    this.toNotify = ['config', 'evolution'];
    this.mockState = {
      t: 0,
      position: [260.3, 0, -8.5, 0],
      joints: [0, 0, 120, 0],
      speed: 200,
      gripper: [0, 0],
      lastAction: null,
    };
  }

  /**
   * Start the controller for user: 'username'.
   *   - If username is valid, then its controller is started.
   *   - If invalid or no username, the default controller is started.
   * @param {string} username The name of the user that request to start the controller.
   */
  start(username) {
    logger.debug(`User ${username} request to start Dobot controller`);
    if(this.connected) return;
    if (process.env.DOBOT_MODE !== 'real') {
      return this.startMock(username);
    }
    /* Start user or default controller */
    logger.info('Dobot Adapter: Starting default controller...');
    this.conn = spawn('sudo',['python3', `../var/controllers/${this.controller.id}/${this.controller.path}`]);
    this.conn.on('error', function(error) { console.log(error); });
    this.commandSocket = zmq.socket('req');
    //this.commandSocket.on('message', this.ondata.bind(this));
    var endpoint = 'tcp://127.0.0.1:5555';
    this.commandSocket.connect(endpoint);
    var endpointData = 'tcp://127.0.0.1:5556';
    this.dataSocket = zmq.socket('sub');
    this.dataSocket.connect(endpointData);
    this.dataSocket.subscribe('evolution');
    this.dataSocket.on('message', this.ondata.bind(this));
  }

  startMock(username) {
    logger.info('Dobot Adapter: Starting local mock controller for DOBOT M1 integration validation...');
    this.connected = true;
    this.state.config = 2;
    this._notifyMockState();
    this.mockInterval = setInterval(() => {
      this.mockState.t += 0.5;
      this._notifyMockState();
    }, 500);
  }

  /*
   * Format the data received from the controller and forward to the clients
   * @param {object} ev The event with the data received from the controller.
   */
  ondata(message) {
    super.ondata(message.toString());
  }

  /* Send a command to write the value of a variable in the controller.
   * @patam {string}   variable the name of the variable
   * @patam {string}   value    the value of the variable
   * @patam {function} callback Invoked after success
   */
  write(variable, value, callback) {
    if (process.env.DOBOT_MODE !== 'real') {
      return this.writeMock(variable, value, callback);
    }
    try {
      this.state[variable] = value;
      console.log(`${variable}:[${value}]`);
      this.commandSocket.send(`${variable}:[${value}]`);
    } catch(e) {
      logger.error(`0mq Adapter: Cannot write ${variable}. Ignore this message if appears immediately after disconnection.`)
    }
  }

  writeMock(variable, value, callback) {
    this.state[variable] = value;
    logger.info(`Dobot mock command received: ${variable}=${JSON.stringify(value)}`);

    if (variable === 'config') {
      this.state.config = Array.isArray(value) ? value[0] : value;
      this.notify('signals.get', { variable: 'config', value: this.state.config });
      if (callback) callback();
      return;
    }

    if (variable === 'action') {
      this._applyMockAction(value);
      this._notifyMockState();
    }

    if (callback) callback();
  }

  _applyMockAction(value) {
    const action = Array.isArray(value) ? value[0] : value;
    const args = Array.isArray(value) ? value.slice(1) : [];
    this.mockState.lastAction = { action, args, at: new Date().toISOString() };

    switch (action) {
      case 4: // SPEED_JOG
      case 5: // SPEED_PTP
        this.mockState.speed = Number(args[0]) || this.mockState.speed;
        break;
      case 7: // MOVE_POINT_ANGLE
        this.mockState.joints = args.slice(0, 4).map(Number);
        break;
      case 8: // MOVE_POINT_XYZ
        this.mockState.position = args.slice(0, 4).map(Number);
        break;
      case 12: // MOVE_JOINT
        this.mockState.joints[0] += Number(args[0]) || 0;
        break;
      case 13: // MOVE_COORDINATE
        this._moveMockCoordinate(Number(args[0]) || 0);
        break;
      case 14: // GRIP
        this.mockState.gripper = args.map(Number);
        break;
      case 15: // STOP
      case 16: // ABORT
        this.state.config = 3;
        break;
      default:
        break;
    }
  }

  _moveMockCoordinate(axis) {
    const step = 5;
    const axisMap = {
      1: [1, step],
      2: [2, step],
      3: [0, -step],
      4: [0, step],
      5: [1, -step],
      6: [2, -step],
      7: [3, -step],
      8: [3, step],
    };
    const target = axisMap[axis];
    if (!target) return;
    this.mockState.position[target[0]] += target[1];
  }

  _notifyMockState() {
    const evolution = [
      this.mockState.t,
      ...this.mockState.position,
      ...this.mockState.joints,
      this.mockState.speed,
    ];
    this.state.evolution = evolution;
    this.notify('signals.get', { variable: 'evolution', value: evolution });
  }

  stop() {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = undefined;
    }
    if (this.commandSocket) {
      this.commandSocket.close();
      this.commandSocket = undefined;
    }
    if (this.dataSocket) {
      this.dataSocket.close();
      this.dataSocket = undefined;
    }
    super.stop();
  }
}

module.exports.Adapter = DobotAdapter;
