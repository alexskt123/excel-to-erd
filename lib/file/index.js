const fs = require('fs');
const config = require('../../config');
const XLSX = require('xlsx');
const distinct = require('distinct');
const { pascalCase } = require('change-case');
// const plantuml = require('plantuml');
const plantuml = require('node-plantuml-latest');
const TableObject = require('../class/tableObject');
const WorkstreamRelationship = require('../class/workstreamRelationship');
//plantuml.useNailgun(); // Activate the usage of Nailgun

const getFilesFromPath = (filePath, fileExt) => {
  try {
    const filenames = fs.readdirSync(filePath);
    const csvFiles = filenames.filter((x) => x.replace(fileExt) !== x);
    return csvFiles;
  } catch (_e) {
    return [];
  }
};

const processXlsxFiles = () => {
  const xlsxFiles = getFilesFromPath(config.inputPath, '.xlsx');
  const acceptXLSXSheetNames = config.acceptXLSXSheetNames;

  const acceptXLSXSheetNamesCount = acceptXLSXSheetNames.reduce((a, c) => {
    return { ...a, [c]: 0 };
  }, {});
  const acceptXLSXSheetContent = acceptXLSXSheetNames.reduce((a, c) => {
    return { ...a, [c]: null };
  }, {});

  xlsxFiles.forEach((file) => {
    const excelFile = XLSX.readFile(file);
    acceptXLSXSheetNames.forEach((x) => {
      const sheet = excelFile.Sheets[x];
      if (sheet) {
        acceptXLSXSheetNamesCount[x] = acceptXLSXSheetNamesCount[x] + 1;

        var content = XLSX.utils.sheet_to_json(sheet);
        acceptXLSXSheetContent[x] = content;
      }
    });
  });

  // Check if the accepting sheet more than 1 sheet or not, if yes, throw error
  if (Object.keys(acceptXLSXSheetNamesCount).some((x) => acceptXLSXSheetNamesCount[x] > 1)) {
    throw `More than one sheet!`;
  }

  return acceptXLSXSheetContent;
};

const writeFile = (fileName, fileContent, path) => {
  fs.writeFileSync(`${path}${fileName}`, fileContent);
};

const refreshOutputDir = (dir) => {
  if (fs.existsSync(dir)) {
    fs.rmdirSync(dir, { recursive: true });
  }
  fs.mkdirSync(dir);
};

const delay = async (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

const outputDiagrams = async (dataDict) => {
  const umlTextOutputPath = config.outputPath.plantuml;
  const imageOutputPath = config.outputPath.image;
  refreshOutputDir(umlTextOutputPath);
  refreshOutputDir(imageOutputPath);

  const distinctWorkstreamList = distinct(dataDict.map((x) => x['Workstream'])).filter((x) => x && x !== '');

  distinctWorkstreamList.forEach((workstream) => {
    const curDataDict = dataDict.filter((x) => x['Workstream'] === workstream);

    const distinctTableList = distinct(curDataDict.map((x) => x['Table Name'])).filter(
      (x) => x && x !== '' && x.replace('hst', '') === x,
    );
    const umlScript = distinctTableList.reduce((acc, cur) => {
      const tableObj = new TableObject(
        cur,
        curDataDict.filter((x) => x['Table Name'] === cur),
      );
      const script = tableObj.objectScript;
      return `${acc}${script}`;
    }, '');

    const workstreamRelationship = new WorkstreamRelationship(curDataDict);
    const relationshipScript = workstreamRelationship.relationshipScript;

    writeFile(`${workstream}.txt`, `@startuml\n${umlScript}${relationshipScript}@enduml`, umlTextOutputPath);
  });

  for (const workstream of distinctWorkstreamList) {
    await delay(1000);
    const gen = plantuml.generate(`${umlTextOutputPath}${workstream}.txt`);
    gen.out.pipe(fs.createWriteStream(`${imageOutputPath}${workstream}.png`));
  }
};

const outputSQL = (dataDict) => {
  const sqlOutputPath = config.outputPath.sql;
  refreshOutputDir(sqlOutputPath);

  const distinctTableList = distinct(dataDict.map((x) => x['Table Name'])).filter((x) => x && x !== '');

  const createTableSQL = distinctTableList.reduce((acc, cur, idx) => {
    const tableObj = new TableObject(
      cur,
      dataDict.filter((x) => x['Table Name'] === cur),
    );

    return `${acc}${tableObj.createTableSQLScript}\n`;
  }, ``);

  writeFile('CreateTables.sql', createTableSQL, sqlOutputPath);
};

const outputFiles = async (xlsxContent, options) => {
  const { sql, erd } = options;
  const dataDict = xlsxContent['Data Dict'];

  sql && outputSQL(dataDict);
  erd && (await outputDiagrams(dataDict));
};

module.exports = {
  processXlsxFiles,
  getFilesFromPath,
  outputFiles,
  refreshOutputDir,
};
