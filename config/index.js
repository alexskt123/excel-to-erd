const config = {
  inputPath: './',
  outputPath: {
    base: './output/',
    plantuml: './output/plantuml/',
    image: './output/diagram/',
  },
  acceptXLSXSheetNames: ['Data Dict'],
  allowHstTables: ['txn_tran_hst', 'txn_tran_dtl_fund_hst']
};

module.exports = config;
