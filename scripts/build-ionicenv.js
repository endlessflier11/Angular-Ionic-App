const { resolve, relative } = require('path');
const { writeFileSync } = require('fs-extra');
const CryptoJS = require('crypto-js');
const camelCase = require('camelcase');
const { execSync } = require('child_process');

const { version } = require('../package.json');
const ionicConfig = require(resolve(process.cwd(), 'ionic.config'));

if (!process.env.FASTLANE_EXEC) {
  console.log('\x1b[36m', `Load local .env file`, '\x1b[0m');
  require('dotenv').config();
}

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function makeWebSafe(encodedString) {
  return encodedString.replace(/\+/g, '-').replace(/\//g, '_');
}

const encryptionKey = makeid(39);

let gitHash = execSync('git rev-parse --short HEAD').toString().replace('\n', '');
if (!gitHash) {
  gitHash = process.env.CI_GIT_COMMIT_SHA;
}
console.log('\x1b[36m', `Using git hash: ${gitHash}`, '\x1b[0m');

const ionicEnvInfo = {
  appId: ionicConfig.pro_id || ionicConfig.app_id || ionicConfig.id,
  appVersion: version,
  gitHash,
  __DEV_PREFS__: {},
};

// Add IONIC_ENV starting environmentals to process.env
Object.keys(process.env).forEach((key) => {
  if (key.indexOf('IONIC_ENV_') === 0) {
    ionicEnvInfo[camelCase(key.replace('IONIC_ENV_', ''))] = process.env[key];
  }
});

// Add User Pref Environment keys
Object.keys(process.env).forEach((key) => {
  if (key.indexOf('PREF_') === 0) {
    ionicEnvInfo['__DEV_PREFS__'][key] = process.env[key];
  }
});

const encEnvironment = {
  appVersion: ionicEnvInfo.appVersion,
  gitHash,
  codeInject: encryptionKey,
  code: makeWebSafe(
    CryptoJS.AES.encrypt(JSON.stringify(ionicEnvInfo), encryptionKey.substring(5, 34)).toString()
  ),
};

// generate file
const ionicEnvfile = resolve(__dirname, '..', 'src', 'environments', 'ionic-env.ts');
writeFileSync(
  ionicEnvfile,
  `// IMPORTANT: THIS FILE IS AUTO GENERATED! DO NOT MANUALLY EDIT OR CHECKIN!
/* eslint-disable */
export const IonicEnvironment = ${JSON.stringify(encEnvironment, null, 4)};
`,
  { encoding: 'utf-8' }
);
console.log(
  '\x1b[36m',
  `Wrote IonicEnvironment info to ${relative(resolve(__dirname, '..'), ionicEnvfile)}`,
  '\x1b[0m'
);

const versionFile = resolve(__dirname, '..', 'src', 'assets', 'version.txt');
writeFileSync(versionFile, version);
console.log(
  '\x1b[36m',
  `Wrote IonicEnvironment info to ${relative(resolve(__dirname, '..'), versionFile)}`,
  '\x1b[0m'
);

console.log('');
