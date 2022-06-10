const config = require("../../config");

const checkAllowTableName = (tableName) => {
    return config.allowHstTables.some(x => x === tableName) || tableName.replace('hst', '') === tableName;
}

module.exports = checkAllowTableName;
