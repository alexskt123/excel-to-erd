const { mysqlConverter } = require('../../config');

const convertedDataType = (dataType) => {
  const dataTypeUpper = dataType.toUpperCase();
  const convertedDataType = mysqlConverter.find((x) => dataTypeUpper.startsWith(x.mapper));
  const values = /\(.*\)/g.exec(dataTypeUpper);

  return convertedDataType?.type ? `${convertedDataType.type}${values?.find((x) => x) || ''}` : dataTypeUpper;
};

module.exports = {
  convertedDataType,
};
