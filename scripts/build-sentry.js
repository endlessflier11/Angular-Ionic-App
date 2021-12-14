const { execSync } = require('child_process');
const { version } = require('../package.json');

if (process.env.SENTRY_UPLOAD_SOURCE_MAP === 'true') {
  execSync(`npx sentry-cli releases new ${version}`, { stdio: 'inherit' });
  execSync(`npx sentry-cli releases set-commits ${version} --auto`, { stdio: 'inherit' });
  execSync(
    `npx sentry-cli releases files ${version} upload-sourcemaps ./www -x .js -x .map --validate --verbose --rewrite --strip-common-prefix`,
    { stdio: 'inherit' }
  );
  execSync(`npx sentry-cli releases finalize ${version}`, { stdio: 'inherit' });
}
