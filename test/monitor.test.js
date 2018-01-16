'use strict';
let EventEmitter = require('events');
let Monitor = require('../lib/monitor').Monitor;

describe('Monitor', () => {
  describe('constructor', () => {
    it('inherits from EventEmitter', () => {
      let mon = new Monitor('HostName=test.com;DeviceId=dev;SharedAccessKey=key');
      expect(mon).toBeInstanceOf(EventEmitter);
    });
  });
});