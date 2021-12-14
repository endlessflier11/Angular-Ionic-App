const commander = require('commander');
const { copyFileSync } = require('fs');
const { execSync } = require('child_process');

commander.option('--DEV', 'To release to DEV Firebase').parse(process.argv);
const program = commander.opts();

console.log('\x1b[36m', 'Publishing dSYM in /tmp', '\x1b[0m');
console.log('');

if (program.DEV) {
  copyFileSync(
    './resources/ios/plist/debug/GoogleService-Info.plist',
    './tmp/GoogleService-Info.plist'
  );
} else {
  copyFileSync(
    './resources/ios/plist/release/GoogleService-Info.plist',
    './tmp/GoogleService-Info.plist'
  );
}

execSync('./scripts/upload-symbols -gsp ./tmp/GoogleService-Info.plist -p ios ./tmp', {
  stdio: 'inherit',
});

console.log('');
