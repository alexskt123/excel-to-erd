const checkAllowTableName = require("../../util");

class WorkstreamRelationship {
  constructor(dataDict) {
    this._dataDict = dataDict;
  }

  get relationshipList() {
    return this._dataDict.filter(
      (x) => x['Foreign Key Table'] && checkAllowTableName(x['Table Name']),
    );
  }
  get relationshipScript() {
    return this.relationshipList.reduce((a, c) => {
      const fieldScript = `${c['Table Name']}::${c['Field Name']} --> ${c['Foreign Key Table']}::${c['Foreign Key Field']}\n`;
      return `${a}${fieldScript}`;
    }, '');
  }
}

module.exports = WorkstreamRelationship;
