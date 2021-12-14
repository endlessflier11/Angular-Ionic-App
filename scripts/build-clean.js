const { readFileSync } = require('fs');
const rimraf = require('rimraf');
const { execSync } = require('child_process');

console.log('\x1b[36m', 'Clean all working folders', '\x1b[0m');
var contents = readFileSync('package.json');
var package = JSON.parse(contents);

package.aaaWorkspaces.cleanFolders.forEach((folder) => {
  console.log('\x1b[33m', `Delete folder ./${folder}`, '\x1b[0m');
  rimraf(`./${folder}`, [], (error) => {
    if (error) {
      console.error(error);
    }
  });
});

// the following command is for legacy, should not cause issues
execSync('rm -rf ./node_modules/@aaa-mobile/appinit', { stdio: 'inherit' });
execSync('rm -rf ./node_modules/@aaa-mobile/common', { stdio: 'inherit' });
execSync('rm -rf ./node_modules/@aaa-mobile/core', { stdio: 'inherit' });
execSync('rm -rf ./node_modules/@aaa-mobile/deploy', { stdio: 'inherit' });
execSync('rm -rf ./node_modules/@aaa-mobile/microapps', { stdio: 'inherit' });
execSync('rm -rf ./node_modules/@aaa-mobile/zipgate', { stdio: 'inherit' });
