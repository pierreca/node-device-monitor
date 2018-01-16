'use strict';
let EventEmitter = require('events');
let os = require('os');

class HeartBeat extends EventEmitter {
  constructor(interval) {
    super();
    this._interval = interval;
  }

  start() {
    this._timer = setTimeout(this._timerHandler.bind(this), this._interval);
  }

  stop() {
    if (this.isRunning()) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
  }

  isRunning() {
    return !!this._timer;
  }

  setInterval(newInterval) {
    this._interval = newInterval;
    this._resetTimer();
  }

  _createHeartBeatMessage() {
    return {
      currentTime: Date.now(),
      processUptime: process.uptime(),
      systemUptime: os.uptime()
    };
  }

  _resetTimer() {
    if (this.isRunning()) {
      clearTimeout(this._timer);
    }
    this._timer = setTimeout(this._timerHandler.bind(this), this._interval);
  }

  _emitHeartBeatMessage() {
    this.emit('heartbeat', this._createHeartBeatMessage());
  }

  _timerHandler() {
    this._emitHeartBeatMessage();
    this._resetTimer();
  }
}

module.exports.HeartBeat = HeartBeat;
