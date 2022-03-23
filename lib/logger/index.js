const Logger = require('simple-node-logger'),
  opts = {
    logFilePath: 'genERD.log',
    timestampFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  log = Logger.createSimpleLogger(opts);

module.exports = log;
