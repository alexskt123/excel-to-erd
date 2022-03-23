class TableObject {
  constructor(table, fieldList) {
    this._table = table;
    this._fieldList = fieldList;
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
