const { readFileSync, writeFileSync, existsSync } = require('fs');
const { execSync } = require('child_process');
const commander = require('commander');
const inquirer = require('inquirer');

const PROJECT_ID = 'aaa-mobile-deventerprise';
const ANDROID_APP = '1:557819070465:android:5aca8c158414daf0';
const IOS_APP = '1:557819070465:ios:5e21c59d821bb1479f5800';

const RELEASE_NOTES_DEV_FILE = './tmp/release-notes-development.txt';
const RELEASE_NOTES_PROD_FILE = './tmp/release-notes-production.txt';
const RELEASE_NOTES_APPSTORE_FILE = './tmp/release-notes-appstore.txt';

const GROUPS_ANDROID_DEV_FILE = './fastlane/fb-android-groups-development.txt';
const GROUPS_ANDROID_PROD_FILE = './fastlane/fb-android-groups-production.txt';
const GROUPS_ANDROID_APPSTORE_FILE = './fastlane/fb-android-groups-appstore.txt';
const GROUPS_IOS_DEV_FILE = './fastlane/fb-ios-groups-development.txt';
const GROUPS_IOS_PROD_FILE = './fastlane/fb-ios-groups-production.txt';

commander
  .option(
    '-n, --versionName [value]',
    'Version to tag and publish [<newversion> | major | minor | patch | prerelease]',
    'prerelease'
  )
  .parse(process.argv);
const program = commander.opts();

const promptReleaseNotesID = 'release-notes-confirm';
const promptFilesID = 'files-confirm';
inquirer
  .prompt([
    {
      name: promptReleaseNotesID,
      type: 'confirm',
      message: 'Did you prepare a release-notes.txt file in tmp folder?\n',
      default: false,
    },
    {
      name: promptFilesID,
      type: 'confirm',
      message: 'Did you put the new files into tmp folder?\n',
      default: false,
    },
  ])
  .then((answers) => {
    const moveForward = answers[promptReleaseNotesID] && answers[promptFilesID];
    moveForward
      ? uploadApplication()
      : console.log('Add a release-notes.txt and files into the tmp folder!');
  });

function uploadApplication() {
  const releaseNotes = readFileSync('./tmp/release-notes.txt', 'utf-8');
  const devReleaseNotes = `DEV ${releaseNotes}`;
  const prodReleaseNotes = `PROD ${releaseNotes}`;
  const appstoreReleaseNotes = `APPSTORE ${releaseNotes}`;

  writeFileSync(RELEASE_NOTES_DEV_FILE, devReleaseNotes);
  writeFileSync(RELEASE_NOTES_PROD_FILE, prodReleaseNotes);
  writeFileSync(RELEASE_NOTES_APPSTORE_FILE, appstoreReleaseNotes);

  executeUpload(
    `${program.versionName}-DEV.apk`,
    ANDROID_APP,
    GROUPS_ANDROID_DEV_FILE,
    RELEASE_NOTES_DEV_FILE
  );
  executeUpload(
    `${program.versionName}-PROD.apk`,
    ANDROID_APP,
    GROUPS_ANDROID_PROD_FILE,
    RELEASE_NOTES_PROD_FILE
  );
  // prettier-ignore
  executeUpload(`${program.versionName}-APPSTORE.apk`, ANDROID_APP, GROUPS_ANDROID_APPSTORE_FILE, RELEASE_NOTES_APPSTORE_FILE);
  // prettier-ignore
  executeUpload(`${program.versionName}-ADHOC-DEV.ipa`, IOS_APP, GROUPS_IOS_DEV_FILE, RELEASE_NOTES_DEV_FILE);
  // prettier-ignore
  executeUpload(`${program.versionName}-ADHOC-PROD.ipa`, IOS_APP, GROUPS_IOS_PROD_FILE, RELEASE_NOTES_PROD_FILE);
}

function executeUpload(filename, app, groupFile, releaseNotesFile) {
  try {
    console.log('\x1b[33m', `\n\nTry to upload file: ${filename}\n\n`, '\x1b[0m');

    if (existsSync(`./tmp/${filename}`)) {
      execSync(
        `firebase appdistribution:distribute ./tmp/${filename} --project ${PROJECT_ID} --app ${app} --groups-file ${groupFile} --release-notes-file ${releaseNotesFile}`,
        { stdio: 'inherit' }
      );
    } else {
      console.warn(`File with name ${filename} does not exist`);
    }
  } catch (error) {
    console.error(error.message);
  }
}
