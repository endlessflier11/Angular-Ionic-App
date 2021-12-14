const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function recFindByExt(base, ext, files, result) {
  files = files || fs.readdirSync(base);
  result = result || [];
  files.forEach(function (file) {
    var newbase = path.join(base, file);
    if (fs.statSync(newbase).isDirectory()) {
      result = recFindByExt(newbase, ext, fs.readdirSync(newbase), result);
    } else {
      if (file.substr(-1 * (ext.length + 1)) == '.' + ext) {
        result.push(newbase);
      }
    }
  });
  return result;
}

const failedFiles = [];
const problematicImportPrefixes = [
  'src/app', // static imports
  '@csaadigital/mobile-mypolicy', // packaged imports
];
const regExp = new RegExp(`['"](${problematicImportPrefixes.join('|')})`);

['ts', 'scss'].forEach((ext) => {
  failedFiles.push(
    ...recFindByExt('./src/app/micro-apps/csaa-mobile', ext).filter((fileName) => {
      const filePath = path.resolve(process.cwd(), fileName);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, { encoding: 'utf-8' });
        return regExp.test(content);
      }
      return false;
    })
  );
});

if (failedFiles.length > 0) {
  console.log(chalk.red.bold(`\nERROR: The following files contains static imports:\n`));
  console.log('\t' + chalk.red(failedFiles.join('\n\t')));
  console.log(
    `\nERROR: Static imports inside ${chalk.underline.blue(
      'micro-apps/csaa-mobile'
    )} are not allowed\nbecause it will make integrated build to fail.\n\n\t${chalk.green(
      '!! Configure your editor to always use relative imports !!'
    )}\n`
  );
}

process.exit(failedFiles.length === 0 ? 0 : 1);
