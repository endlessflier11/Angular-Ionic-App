const minimist = require('minimist');
const fs = require('fs');
const libxml = require('libxmljs');
const configXmlPath = './config.xml';
const packageJsonPath = './package.json';

function updateVersionNumber() {
  const args = minimist(process.argv);
  const buildNumber = args.buildNumber;
  if (!buildNumber) {
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const newVersionNumber = packageJson.version + '-' + buildNumber;
  packageJson.version = newVersionNumber;
  fs.writeFileSync('./package.json', JSON.stringify(packageJson));

  const xml = fs.readFileSync(configXmlPath, 'utf-8');
  const xmlDoc = libxml.parseXmlString(xml);
  const ionicPlugin = xmlDoc.get(
    `//xmlns:widget[@id='com.aaa.csaa_insurance.mypolicy']`,
    'http://www.w3.org/ns/widgets'
  );

  ionicPlugin.attr('version', newVersionNumber);
  fs.writeFileSync(configXmlPath, xmlDoc.toString());
}

updateVersionNumber();
