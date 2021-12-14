const { execSync } = require('child_process');

module.exports = {
  checkForCleanRepo,
};

function getGitStatus() {
  const gitStatusRaw = execSync('git status --porcelain=v1 2>/dev/null | wc -l', {
    encoding: 'utf8',
  });
  return +gitStatusRaw.trim();
}

function checkForCleanRepo(successCallback) {
  if (!successCallback || typeof successCallback !== 'function') {
    console.log('\x1b[31m', '\n\nSuccess callback is not a function\n\n', '\x1b[0m');
    return;
  }

  const cleanRepo = getGitStatus() === 0;
  if (cleanRepo) {
    successCallback();
  } else {
    console.log(
      '\x1b[31m',
      '\n\nPlease commit or discard your changes before running this script\n\n',
      '\x1b[0m'
    );
  }
}
