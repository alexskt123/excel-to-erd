const fs = require('fs');
const config = require('../../config');
const XLSX = require('xlsx');
const distinct = require('distinct');
const { pascalCase } = require('change-case');
// const plantuml = require('plantuml');
const plantuml = require('node-plantuml-latest');
const TableObject = require('../class/tableObject');
const WorkstreamRelationship = require('../class/workstreamRelationship');
const checkAllowTableName = require('../util');
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

const writeFile = (tableName, fileContent, path) => {
  const fileName = `${tableName}.txt`;
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

const outputUMLFiles = async (xlsxContent) => {
  const umlTextOutputPath = config.outputPath.plantuml;
  const imageOutputPath = config.outputPath.image;
  refreshOutputDir(umlTextOutputPath);
  refreshOutputDir(imageOutputPath);

  const dataDictSheet = xlsxContent['Data Dict'];

  if (!dataDictSheet) {
    throw "No Data Dict Sheet! Please amend at least one sheet with name - Data Dict";
  }

  const distinctWorkstreamList = distinct(dataDictSheet.map((x) => x['Workstream'])).filter(
    (x) => x && x !== '',
  );

  distinctWorkstreamList.forEach((workstream) => {
    const dataDict = dataDictSheet.filter((x) => x['Workstream'] === workstream);

    const distinctTableList = distinct(dataDict.map((x) => x['Table Name'])).filter(
      (x) => x && x !== '' && checkAllowTableName(x),
    );
    const umlScript = distinctTableList.reduce((acc, cur) => {
      const tableObj = new TableObject(
        cur,
        dataDict.filter((x) => x['Table Name'] === cur),
      );
      const script = tableObj.objectScript;
      return `${acc}${script}`;
    }, '');

    const workstreamRelationship = new WorkstreamRelationship(dataDict);
    const relationshipScript = workstreamRelationship.relationshipScript;

    writeFile(workstream, `@startuml\n${umlScript}${relationshipScript}@enduml`, umlTextOutputPath);
  });

  for (const workstream of distinctWorkstreamList) {
    await delay(1000);
    const gen = plantuml.generate(`${umlTextOutputPath}${workstream}.txt`);
    gen.out.pipe(fs.createWriteStream(`${imageOutputPath}${workstream}.png`));
  }
};

module.exports = {
  processXlsxFiles,
  getFilesFromPath,
  outputUMLFiles,
  refreshOutputDir,
};
