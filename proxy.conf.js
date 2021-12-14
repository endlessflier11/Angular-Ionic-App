const fs = require('fs');

let PROXY_CONFIG = {};

try {
  if (fs.existsSync('./proxy-aaa.conf.json')) {
    const aaaProxyConfString = fs.readFileSync('./proxy-aaa.conf.json');
    const aaaProxyConf = JSON.parse(aaaProxyConfString);

    PROXY_CONFIG = {
      ...PROXY_CONFIG,
      ...aaaProxyConf,
    };
  }

  if (fs.existsSync('./proxy.conf.json')) {
    const proxyConfString = fs.readFileSync('./proxy.conf.json');
    const proxyConf = JSON.parse(proxyConfString);

    PROXY_CONFIG = {
      ...PROXY_CONFIG,
      ...proxyConf,
    };
  }
} catch (err) {
  console.error(err);
}

console.log(PROXY_CONFIG);

module.exports = PROXY_CONFIG;
