const commander = require('commander');
const {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  lstatSync,
  copyFileSync,
} = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const rimraf = require('rimraf');
const { IncomingWebhook } = require('@slack/webhook');
var inquirer = require('inquirer');
const nodemailer = require('nodemailer');
const { checkForCleanRepo } = require('./common');

const releaseNotePath = './projects/module-release-notes.md';
const currentReleaseMarker = 'Current Release:';
const ACG_SLACK_URL =
  'https://hooks.slack.com/services/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';
const CLEVERTECH_SLACK_URL =
  'https://hooks.slack.com/services/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';

commander
  .option(
    '-n, --versionName [value]',
    'Version to tag and publish [<newversion> | major | minor | patch | prerelease]',
    'patch'
  )
  .option('-t, --tag [value]', 'Tag to publish the modules with')
  .parse(process.argv);
const program = commander.opts();

console.log('\x1b[36m', '\n\nPublishing AAA shared and native-docti=or packages\n', '\x1b[0m');

const promptID = 'release-notes-confirm';
inquirer
  .prompt([
    {
      name: promptID,
      type: 'confirm',
      message:
        'Did you update the release notes in module-release-notes.md?\n' +
        '(If yes then release notes will publish to ACG and MWG slack)',
      default: false,
    },
  ])
  .then((answers) => {
    const moveForward = answers[promptID];
    moveForward
      ? checkForCleanRepo(releaseModules)
      : console.log('Update the release notes, then try this again!');
  });

function releaseModules() {
  const version = program.versionName;
  const tag = program.tag;
  const oldVersion = JSON.parse(readFileSync('./projects/aaa-shared/package.json')).version;

  buildAndPublishAAAShared(version, tag);
  buildAndPublishNativeDoctor(version, tag);

  console.log('');

  if (tag == 'beta') {
    return console.log(`Beta version not publishing release notes`);
  }

  const publishedVersion = JSON.parse(readFileSync('./projects/aaa-shared/package.json')).version;
  publishReleaseNotes(publishedVersion, oldVersion);

  console.log('');

  console.log('\x1b[36m', `Commiting changes`, '\x1b[0m');
  execSync('git add .');
  execSync(
    `git commit -m "CHORE: Published shared package and native-doctor as version v${publishedVersion}"`
  );
  console.log('');
  console.log('');
  console.log('\x1b[36m', `Done`, '\x1b[0m');

  function buildAndPublishAAAShared(version, tag) {
    const projectDirPath = `./projects/aaa-shared`;
    const distDirPath = `./dist/aaa-shared`;
    updateVersion(projectDirPath, version);

    console.log('\x1b[36m', 'Building shared module', '\x1b[0m');
    buildAAAShared(projectDirPath, distDirPath);

    console.log('\x1b[36m', 'Publishing shared module', '\x1b[0m');
    publishModule(distDirPath, tag);

    rimraf.sync(distDirPath);
  }

  function buildAndPublishNativeDoctor(version, tag) {
    const directoryPath = `./projects/native-doctor`;
    const distDirPath = `./dist/native-doctor`;

    updateVersion(directoryPath, version);
    buildNativeDoctor(directoryPath);
    publishModule(distDirPath, tag);
  }

  function updateVersion(directoryPath, version) {
    const currentDirectory = process.cwd();
    process.chdir(directoryPath);
    execSync(`npm version --no-git-tag-version ${version} --allow-same-version`);
    process.chdir(currentDirectory);
  }

  function publishModule(directoryPath, tag) {
    const currentDirectory = process.cwd();
    process.chdir(directoryPath);
    const publishCommand = tag ? `npm publish --tag ${tag}` : 'npm publish';
    execSync(publishCommand);
    process.chdir(currentDirectory);
  }

  function buildAAAShared(projectDirPath, distDirPath) {
    const contents = JSON.parse(readFileSync('package.json'));
    if (existsSync(distDirPath)) {
      rimraf.sync(distDirPath);
    }
    mkdirSync(distDirPath, { recursive: true });

    copyFileSync(`${projectDirPath}/package.json`, `${distDirPath}/package.json`);
    copyFolderRecursiveSync('./src/projects/assets', distDirPath);
    contents.aaaWorkspaces.libraries.forEach((library) => {
      copyFileSync(`${projectDirPath}/${library}.ts`, `${distDirPath}/${library}.ts`);
      copyFolderRecursiveSync(`./src/projects/${library}`, `${distDirPath}/src`);
    });
  }

  function buildNativeDoctor(projectDirPath) {
    const currentDirectory = process.cwd();
    process.chdir(projectDirPath);
    execSync('npm install');
    execSync('npm run build');
    process.chdir(currentDirectory);
  }

  function copyFolderRecursiveSync(source, target) {
    var files = [];

    var targetFolder = path.join(target, path.basename(source));
    if (!existsSync(targetFolder)) {
      mkdirSync(targetFolder, { recursive: true });
    }

    if (lstatSync(source).isDirectory()) {
      files = readdirSync(source);
      files.forEach(function (file) {
        if (file !== '.DS_Store') {
          var curSource = path.join(source, file);
          var curTarget = path.join(targetFolder, file);
          if (lstatSync(curSource).isDirectory()) {
            copyFolderRecursiveSync(curSource, targetFolder);
          } else {
            copyFileSync(curSource, curTarget);
          }
        }
      });
    }
  }

  function publishReleaseNotes(publishedVersion, oldVersion) {
    const releaseNotes = createReleaseNotes(publishedVersion, oldVersion);
    pushReleaseNotesToACG(publishedVersion, releaseNotes);
    pushReleaseNotesToMWG(publishedVersion, releaseNotes);
    pushReleaseNotesToEmail(publishedVersion, releaseNotes);
  }

  function createReleaseNotes(publishedVersion, oldVersion) {
    const releaseNotes = readFileSync(releaseNotePath).toString();
    const currentReleaseNotes = parseOutCurrentReleaseNotes(releaseNotes, oldVersion);

    cutReleaseNotes(releaseNotes, publishedVersion);

    return currentReleaseNotes;
  }

  function parseOutCurrentReleaseNotes(releaseNotes, oldVersion) {
    const oldVersionMarker = `${oldVersion}:`;
    var currentReleaseNotes = releaseNotes.substring(
      releaseNotes.indexOf(currentReleaseMarker) + currentReleaseMarker.length,
      releaseNotes.indexOf(oldVersionMarker)
    );
    return currentReleaseNotes;
  }

  function cutReleaseNotes(releaseNotes, publishedVersion) {
    const newHeader = `${currentReleaseMarker}\n\n${publishedVersion}:`;
    const updateReleaseNotes = releaseNotes.replace(currentReleaseMarker, newHeader);
    writeFileSync(releaseNotePath, updateReleaseNotes);
  }

  async function pushReleaseNotesToACG(publishedVersion, releaseNotes) {
    sendToSlack(ACG_SLACK_URL, publishedVersion, releaseNotes);
  }

  async function pushReleaseNotesToMWG(publishedVersion, releaseNotes) {
    sendToSlack(CLEVERTECH_SLACK_URL, publishedVersion, releaseNotes);
  }

  async function sendToSlack(url, publishedVersion, releaseNotes) {
    const webhook = new IncomingWebhook(url);
    try {
      await webhook.send({
        publishedVersion,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${publishedVersion}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: releaseNotes,
            },
          },
        ],
      });
    } catch (error) {
      console.log('Error send to slack!', error);
    }
  }

  async function pushReleaseNotesToEmail(publishedVersion, releaseNotes) {
    const transport = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: '0251f083be5bc9',
        pass: '7d6b295a85d4de',
      },
    });

    const message = {
      from: 'nathan.christensen@clevertech.biz',
      to: 'nathan.christensen@clevertech.biz',
      subject: `New @aaa-mobile/shared and @aaa-mobile/native-doctor ${publishedVersion} published`,
      text: `Here is what's new in version ${publishedVersion}!\n${releaseNotes}`,
    };
    transport.sendMail(message, function (error, info) {
      if (error) {
        console.log(`Error sending email: ${error}`);
      } else {
        console.log(`Email sent: ${info}`);
      }
    });
  }
}
