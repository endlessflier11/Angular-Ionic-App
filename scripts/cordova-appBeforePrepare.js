const fs = require('fs');

module.exports = function (context) {
  console.log('');
  console.log('\x1b[36m', 'AAA Mobile before prepare');

  if (context.opts.platforms.includes('android')) {
    console.log('\x1b[36m', 'for Android');

    fs.copyFileSync(
      './resources/android/values/colors.xml',
      './platforms/android/app/src/main/res/values/colors.xml'
    );
    fs.copyFileSync(
      './resources/android/values/themes.xml',
      './platforms/android/app/src/main/res/values/themes.xml'
    );
  }

  console.log('');
  console.log('\x1b[0m', '');
};
