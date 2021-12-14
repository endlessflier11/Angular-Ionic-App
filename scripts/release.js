const fs = require('fs');
const commander = require('commander');
const { readFileSync } = require('fs');
const { execSync } = require('child_process');
const { checkForCleanRepo } = require('./common');
const path = require('path');

commander
  .option(
    '-n, --versionName [value]',
    'Version to tag and publish [<newversion> | major | minor | patch | prerelease]',
    'prerelease'
  )
  .option('-p, --patch', 'Only add 1 to version code', false)
  .parse(process.argv);
const program = commander.opts();

console.log('\x1b[36m', '\n\nPreparing release', '\x1b[0m');

function getCurrentAndroidVersionCode() {
  const contents = readFileSync('android/app/build-extras.gradle', 'utf-8');
  const lines = contents.split('\n');
  for (const line of lines) {
    if (line.startsWith('ext.aaaVersionCode=')) {
      const version = line.split('=')[1];
      return version;
    }
  }

  return 0;
}

function releaseNewVersion() {
  // Update main app version
  execSync(`npm version --allow-same-version --no-git-tag-version ${program.versionName}`);

  // Update Android Version
  const currentVersionCode = +getCurrentAndroidVersionCode();
  const newVersionCode = currentVersionCode + (program.patch ? 1 : 10);
  execSync(
    `sed -i -e 's/ext.aaaVersionCode=.*/ext.aaaVersionCode=${newVersionCode}/g' "android/app/build-extras.gradle"`
  );
  execSync(
    `sed -i -e 's/ext.aaaVersionName=.*/ext.aaaVersionName="${program.versionName}"/g' "android/app/build-extras.gradle"`
  );
  fs.unlinkSync('android/app/build-extras.gradle-e');

  // Update iOS Version
  const projectDir = path.resolve('./ios/App/App/');

  execSync(
    `/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString ${program.versionName}" "${projectDir}/Info.plist"`
  );

  // Commit changes to Git
  execSync('git add .');
  execSync(
    `git commit -m "CHORE: Increase version to v${program.versionName} and Android Version Code"`
  );

  console.log('\x1b[36m', `Released`, '\x1b[0m');
  console.log('');
}

checkForCleanRepo(releaseNewVersion);
