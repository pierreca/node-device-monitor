let EventEmitter = require('events');
let uuid = require('uuid');
let Message = require('azure-iot-common').Message;
let IotHubClient = require('azure-iot-device').Client;
let SharedAccessKeyAuthenticationProvider = require('azure-iot-device').SharedAccessKeyAuthenticationProvider;
let Mqtt = require('azure-iot-device-mqtt').Mqtt;
let debug = require('debug')('monitor');
let HeartBeat = require('./heartbeat').HeartBeat;

class Monitor extends EventEmitter {
  constructor(connectionString) {
    super();
    const authProvider = SharedAccessKeyAuthenticationProvider.fromConnectionString(connectionString);
    this._iotClient = IotHubClient.fromAuthenticationProvider(authProvider, Mqtt);
    this._iotClient.on('error', (err) => {
      debug('IoT Hub Client error: ' + err.toString());
      this.emit('error', err);
    });
  }

  start() {
    this._iotClient.open((err) => {
      if (err) {
        debug('Error opening the IoT Hub client: ' + err.toString());
        this.emit('error', err);
      } else {
        this._iotClient.getTwin((err, twin) => {
          if (err) {
            debug('Error getting the device twin: ' + err.toString());
            this.emit('error', err);
          } else {
            twin.on('properties.desired', (props) => {
              debug('new desired properties received: ' + JSON.stringify(props));
              const hbInterval = props.heartBeatInterval;
              if (hbInterval) {
                if (this._heartBeat) {
                  this._heartBeat.setInterval(hbInterval);
                } else {
                  this._startHeartBeat(hbInterval);
                }
              }
            });
          }
        });
      }
    })
  }

  _startHeartBeat(interval) {
    if (this._heartBeat) {
      this._heartBeat.stop();
      this._heartBeat = undefined;
    }

    this._heartBeat = new HeartBeat(interval);
    this._heartBeat.on('error', (err) => {
      debug('Heartbeat error: ' + err.toString());
      this.emit('error', err);
    });
    this._heartBeat.on('heartbeat', (hbInfo) => {
      let msg = new Message(JSON.stringify(hbInfo));
      msg.messageId = uuid.v4();
      this._iotClient.sendEvent(msg, (err) => {
        if (err) {
          debug('ERROR: ' + err.toString());
        } else {
          debug('heartbeat sent: id: ' + msg.messageId);
        }
      });
    });
    this._heartBeat.start();
  }
}

module.exports.Monitor = Monitor;