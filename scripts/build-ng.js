const { execSync } = require('child_process');

let configuration = process.env.IONIC_CONFIGURATION || 'production';

console.log(
  '\x1b[36m',
  `Building app with: npx ng build --configuration=${configuration}'\n`,
  '\x1b[0m'
);
execSync(`rm -rf node_modules/@autoclubgroup/**/node_modules`);
execSync(`npx ng build --configuration=${configuration}`, { stdio: 'inherit' });
execSync(`npx ionic deploy manifest`, { stdio: 'inherit' });
