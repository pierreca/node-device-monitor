'use strict';
let Monitor = require('./lib/monitor').Monitor;
let debug = require('debug')('index');

const connectionString = process.env.IOTHUB_CONNECTION_STRING;
if (!connectionString) {
  debug('IOTHUB_CONNECTION_STRING env variable is not defined: exiting');
  process.exit(-1);
}

const monitor = new Monitor(connectionString);

monitor.on('error', (err) => {
  debug('Fatal error');
  debug(err);
  debug('exiting');
  process.exit(-2);
});

monitor.start();