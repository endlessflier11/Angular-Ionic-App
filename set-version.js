fs = require('fs');
const parseString = require('xml2js').parseString;
const xml2js = require('xml2js');
const util = require('util');

//getting version from command line
if (process.argv.length < 3) {
  console.log('You need to supply the version number as 1st argument');
  process.exit(1);
}
let version = process.argv[2];

function setVersionOnJsonFile(fileName, beforeWrite = () => {}) {
  var file = JSON.parse(fs.readFileSync(fileName).toString());
  file.version = version;
  if (file && file.version == version) {
    beforeWrite.call(beforeWrite, file);
    fs.writeFile(fileName, JSON.stringify(file, null, 2), function (error) {
      if (error) throw error;
      console.log(fileName + ' was updated');
    });
  }
}

function setVersionOnAppTs(beforeWrite = () => {}) {
  const fileName = './src/app/micro-apps/csaa-mobile/assets/config/app-info.ts';
  const data = require(fileName);
  data.version = version;
  if (data && data.version === version) {
    beforeWrite.call(beforeWrite, data);
    const content = util.formatWithOptions({ compact: false }, 'module.exports = %o', data);
    fs.writeFile(fileName, content, function (error) {
      if (error) throw error;
      console.log(fileName + ' was updated');
    });
  }
}

function setConfigXML() {
  const config = './config.xml';
  const configXml = fs.readFileSync(config, 'utf8');
  parseString(configXml, function (err, result) {
    result.widget['$'].version = version;

    const builder = new xml2js.Builder({
      renderOpts: {
        pretty: true,
        indent: '    ',
        newline: '\n',
        spacebeforeslash: ' ',
      },
      headless: true,
    });

    const xml = builder.buildObject(result);

    fs.writeFileSync(
      config,
      `<?xml version='1.0' encoding='utf-8'?>
      ${xml}
      `,
      {
        encoding: 'utf8',
      }
    );
    console.log('config.xml was updated');
  });
}

setVersionOnJsonFile('package.json');

setVersionOnJsonFile('package-lock.json');

setVersionOnJsonFile('src/app/micro-apps/csaa-mobile/package.json');

setVersionOnJsonFile('src/app/micro-apps/csaa-mobile/package-lock.json');

setVersionOnAppTs((data) => {
  data.rollbarDebugBuildNumber = '0';
});

setConfigXML();
