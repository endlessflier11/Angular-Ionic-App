const commander = require('commander');
const { readFileSync } = require('fs');
const { execSync } = require('child_process');
const { checkForCleanRepo } = require('./common');

commander
  .option(
    '-n, --versionName [value]',
    'Version to tag and publish [<newversion> | major | minor | patch | prerelease]',
    'prerelease'
  )
  .option('--aaa-only', 'Only publish the cordova-plugin-aaa-mobile')
  .parse(process.argv);
const program = commander.opts();

console.log('\x1b[36m', '\n\nPublishing AAA plugins', '\x1b[0m');

const contents = readFileSync('package.json');
const package = JSON.parse(contents);
const versions = {};

function publishPlugin() {
  const plugin = 'capacitor-plugin';

  console.log('\x1b[36m', `Publishing ${plugin}`, '\x1b[0m');
  process.chdir(`./projects/${plugin}`);

  // set new version
  execSync(`npm version --no-git-tag-version ${program.versionName} --allow-same-version`);

  const contentsPlugin = readFileSync('package.json');
  const packagePlugin = JSON.parse(contentsPlugin);
  versions[plugin] = packagePlugin.version;

  // publish to npm registry
  execSync('npm publish');

  process.chdir('../../');

  // install new versions
  console.log('');
  console.log('\x1b[36m', 'Install new versions:', '\x1b[0m');
  Object.keys(versions).forEach((plugin) => {
    console.log(`  ${plugin}: ${versions[plugin]}`);
    let isDevDependency = package.devDependencies[`@aaa-mobile/${plugin}`] != undefined;
    execSync(
      `npm install ${isDevDependency ? '--save-dev' : '--save'} @aaa-mobile/${plugin}@${
        versions[plugin]
      }`
    );
  });

  execSync('git add .');
  execSync(
    `git commit -m "CHORE: Published @aaa-mobile/capacitor-plugin v${versions['capacitor-plugin']}"`
  );

  console.log('');
}

checkForCleanRepo(publishPlugin);
