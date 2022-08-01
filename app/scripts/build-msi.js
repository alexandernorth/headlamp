// You need to install wix tool set first
// Reference https://ourcodeworld.com/articles/read/927/how-to-create-a-msi-installer-in-windows-for-an-electron-framework-application
const { MSICreator } = require('electron-wix-msi');
const fs = require('fs');
const path = require('path');
const info = require('../package.json');

const APP_DIR = path.resolve(__dirname, '../dist/win-unpacked');
const OUT_DIR = path.resolve(__dirname, '../dist');
const ARCH = 'x64';

const nameOptions = {
  productName: info.productName,
  version: info.version,
  os: 'win',
  arch: ARCH,
};

// Generate the exe name from electron-builder's artifactName
let installerName = info.build.artifactName.split('.')[0];
Object.entries(nameOptions).forEach(([key, value]) => {
  installerName = installerName.replace(`\${${key}}`, value);
});
installerName += '.msi';

// For reference: https://github.com/felixrieseberg/electron-wix-msi#configuration
const msiOptions = {
  appDirectory: APP_DIR,
  outputDirectory: OUT_DIR,
  description: info.description,
  exe: info.name, // Name of the executable to launch the app, not the final installer.
  name: info.productName,
  manufacturer: info.author.name,
  version: info.version,
  appIconPath: path.resolve(__dirname, '../build/icons/icon.ico'),
  ui: {
    chooseDirectory: true,
  },
};

console.info('Generating MSI with the following options:', msiOptions);

const msiCreator = new MSICreator(msiOptions);

msiCreator.create().then(async () => {
  await msiCreator.compile();

  // Rename the executable to the full name we want.
  const installerPath = path.join(OUT_DIR, installerName);
  fs.renameSync(path.join(OUT_DIR, msiOptions.exe + '.msi'), installerPath);

  console.info('Created .msi installer at: ', installerPath);
});
