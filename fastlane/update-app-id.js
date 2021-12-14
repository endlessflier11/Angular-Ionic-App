/**
 * Since we're using two separate Apple accounts for deployment
 * we have to change the bundle ID for building the appstore version
 * this is the script to do it
 */
const fs = require('fs');
const parseString = require('xml2js').parseString;
const xml2js = require('xml2js');

if (process.argv.length < 3) {
  console.log('You need to supply the app name as 1st argument');
  process.exit(1);
}

const appName = process.argv[2];

console.log(`Changing the app ID to ${appName}`);

const config = './config.xml';
const configXml = fs.readFileSync(config, 'utf8');

parseString(configXml, function(err, result) {
  result.widget['$'].id = appName;

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
});
