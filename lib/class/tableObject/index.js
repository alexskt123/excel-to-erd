const { convertedDataType } = require('../../util');

class TableObject {
  constructor(table, fieldList) {
    this._table = table;
    this._fieldList = fieldList;
  }

  get createTableSQLScript() {
    return `DROP TABLE IF EXISTS ${this._table};
CREATE TABLE ${this._table} (
${this._fieldList.reduce((acc, cur, idx) => {
  const curFieldScript = `\t${cur['Field Name'].replace(' ', '')} ${convertedDataType(cur['Data Type'])} ${
    cur['Primary'] ? 'PRIMARY KEY' : `${cur['Mandatory'] ? 'NOT NULL' : ''}`
  }${idx === this._fieldList.length - 1 ? '' : ','} \n`;
  return `${acc}${curFieldScript}`;
}, '')});\n`;
  }

  get fieldScript() {
    return this._fieldList.reduce((a, c) => {
      const fieldScript = `\t${c['Field Name']} => ${c['Data Type']}`;
      return `${a}${fieldScript}\n`;
    }, '');
  }

  get objectScript() {
    return `map ${this._table} {
    ${this.fieldScript}
}\n`;
  }
}

module.exports = TableObject;
