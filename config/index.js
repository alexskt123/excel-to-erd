const config = {
  inputPath: './',
  outputPath: {
    base: './output/',
    plantuml: './output/plantuml/',
    image: './output/diagram/',
    sql: './output/sql/',
  },
  acceptXLSXSheetNames: ['Data Dict'],
  mysqlConverter: [
    { type: 'VARBINARY', mapper: 'RAW' },
    { type: 'VARCHAR', mapper: 'VARCHAR2' },
    { type: 'DECIMAL', mapper: 'NUMBER' },
    { type: 'LONGTEXT', mapper: 'CLOB' },
  ],
};

module.exports = config;
