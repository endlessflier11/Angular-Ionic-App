const request = require('request');
const minimist = require('minimist');
const fs = require('fs');
const path = require('path');
const wwwFolder = path.join(process.cwd(), 'www');
let packageJson;
let appJson;

if (__dirname.includes('node_modules')) {
  // Prod setup
  packageJson = require('@csaadigital/mobile-mypolicy/package.json');
  appJson = require('@csaadigital/mobile-mypolicy/assets/config/app-info.ts');
} else {
  // Development setup
  packageJson = require('./package.json');
  appJson = require('./assets/config/app-info.ts');
}

if (!fs.existsSync(wwwFolder)) {
  console.error('Please execute this script from a directory containing a "www/" folder');
}

const processFiles = async (files, accessToken, codeVersion) => {
  console.log('Code Version: ', codeVersion);
  const regExp = /es2015\.js$/;
  const jsFiles = files.filter((file) => regExp.test(file));

  const preparedRequest = {
    headers: {
      'content-type': 'multipart/form-data',
    },
    method: 'POST',
    multipart: [
      {
        'Content-Disposition': 'form-data; name="access_token"',
        body: accessToken,
      },
      {
        'Content-Disposition': 'form-data; name="version"',
        body: codeVersion,
      },
    ],
    url: 'https://api.rollbar.com/api/1/sourcemap',
  };

  const retryList = [];

  const buildPromise = (file) => {
    return new Promise((resolve, reject) => {
      request(
        {
          ...preparedRequest,
          multipart: [
            ...preparedRequest.multipart,
            {
              'Content-Disposition': 'form-data; name="minified_url"',
              body: `file:///${file}`,
            },
            {
              'Content-Disposition': `form-data; name="source_map"; filename="${file}.map"`,
              body: fs.readFileSync(path.join(wwwFolder, `${file}.map`)),
            },
          ],
        },
        (err, response, body) => {
          if (err && err.code === 'ECONNRESET') {
            console.log('Will retry: ' + file);
            retryList.push(file);
            resolve();
            return;
          }

          try {
            const respData = JSON.parse(body);
            if (err || respData.err === 0) {
              console.log(`Uploaded source map for ${file}`);
              resolve();
            } else throw new Error('Upload failed: ' + JSON.stringify(respData));
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  };

  try {
    // Test access token with one request
    const [firstFile, ...otherFiles] = jsFiles;
    // If this throws, we won't bother dispatching the rest
    await buildPromise(firstFile);

    // Dispatch the rest
    await Promise.all(otherFiles.map(buildPromise));
    await Promise.all(retryList.map(buildPromise));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

fs.readdir(wwwFolder, async (readdirError, files) => {
  const args = minimist(process.argv);
  const accessToken = args.accessToken || process.env.CSAA_ROLLBAR_UPLOAD_TOKEN;
  if (!accessToken) return;

  // Debug Mode: "node ./source-map-upload.js"
  if (typeof args.prod === 'undefined') {
    return await processFiles(
      files,
      accessToken,
      packageJson.version + `-debug-${appJson.rollbarDebugBuildNumber}`
    );
  }
  // Prod Mode: "node ./source-map-upload.js --prod"
  else {
    return await processFiles(files, accessToken, packageJson.version);
  }
});
