const config = require('./config');
const { processXlsxFiles, outputFiles, refreshOutputDir } = require('./lib/file');
const log = require('./lib/logger');
const program = require('./lib/commander');

try {
  program
    .description('An application for generating Diagrams/SQL files from an Excel file')
    .option('--sql', 'Generate SQL scripts')
    .option('--erd', 'Generate ER Diagrams');

  program.parse();

  const options = program.opts();
  const xlsxContent = processXlsxFiles();

  refreshOutputDir(config.outputPath.base);
  outputFiles(xlsxContent, options);

  log.info('Success!');
} catch (e) {
  log.error(e);
}
