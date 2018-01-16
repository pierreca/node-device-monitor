'use strict';

let EventEmitter = require('events');
let HeartBeat = require('../lib/heartbeat').HeartBeat;

describe('HeartBeat', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('inherits from EventEmitter', () => {
      let hb = new HeartBeat(10);
      expect(hb).toBeInstanceOf(EventEmitter);
    });
  });

  describe('start', () => {
    it('starts a timer at the desired interval', () => {
      const testValue = 10;
      let hb = new HeartBeat(testValue);
      hb.start();
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), testValue);
    });

    it('emits a heartbeat event when the timer is fired', () => {
      const testValue = 10;
      let hb = new HeartBeat(testValue);
      let testCallback = jest.fn();
      hb.on('heartbeat', testCallback);
      hb.start();
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), testValue);
      jest.advanceTimersByTime(testValue + 1);
      expect(testCallback).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(testValue + 1);
      expect(testCallback).toHaveBeenCalledTimes(2);
    });
  });

  describe('stop', () => {
    it('stops the timer', () => {
      let hb = new HeartBeat(10);
      hb.start();
      expect(setTimeout).toHaveBeenCalledTimes(1);
      hb.stop();
      expect(clearTimeout).toHaveBeenCalledTimes(1);
    });

    it('does not call clearTimeout if the timer is not running', () => {
      let hb = new HeartBeat(10);
      hb.stop();
      expect(clearTimeout).not.toHaveBeenCalled();
    });
  })

  describe('isRunning', () => {
    it('is true when the timer is running', () => {
      let hb = new HeartBeat(10);
      hb.start();
      expect(hb.isRunning()).toBe(true);
      hb.stop();
    });

    it('is false if the timer has not started', () => {
      let hb = new HeartBeat(10);
      expect(hb.isRunning()).toBe(false);
    });

    it('is false if the timer has been stopped', () => {
      let hb = new HeartBeat(10);
      hb.start();
      hb.stop();
      expect(hb.isRunning()).toBe(false);
    });
  });
});
