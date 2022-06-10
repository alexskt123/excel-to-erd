const config = require('./config');
const { processXlsxFiles, outputUMLFiles, refreshOutputDir } = require('./lib/file');
const log = require('./lib/logger');

try {
  const xlsxContent = processXlsxFiles();

  refreshOutputDir(config.outputPath.base);
  outputUMLFiles(xlsxContent).catch(e => log.error(e));

  log.info('Success!');
} catch (e) {
  log.error(e);
}
