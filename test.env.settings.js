const path = require('path');
/*
 * Some capabilities must be set to make sure appium can connect to your device.
 * browserName: leave this empty, we want protractor to use the embedded webview
 * autoWebView: true for hybrid applications
 * platformName: device platform name (eg. 'android')
 * platformVersion: version of the android on the device (eg. '7.0')
 * deviceName: for android, it can be the adb device address (eg. 'ce031713733918ed0c')
 * app: the location of the apk (must be absolute)
 *
 * For a full list of available capabilities:
 * https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/caps.md
 */
module.exports = {
  default: {
    selenium_start_process: false,
    selenium_port: 4723,
    selenium_host: '127.0.0.1',
    silent: true,
  },
  androidLocal: {
    selenium_start_process: false,
    selenium_port: 4723,
    selenium_host: '127.0.0.1',
    request_timeout_options: {
      timeout: 300000,
      retry_attempts: 0,
    },
    desiredCapabilities: {
      launchTimeout: 1000000,
      newCommandTimeout: 1000,
      browserName: '',
      autoWebview: true,
      fullReset: false,
      automationName: 'UiAutomator2',
      platformName: 'Android',
      platformVersion: '9',
      deviceName: 'emulator-5554',
      app: path.resolve(__dirname, 'platforms/android/app/build/outputs/apk/debug/app-debug.apk'),
    },
  },
  iosLocal: {
    selenium_start_process: false,
    selenium_port: 4723,
    selenium_host: '127.0.0.1',
    silent: true,
    desiredCapabilities: {
      launchTimeout: 1000000,
      newCommandTimeout: 1000,
      browserName: '',
      isHeadless: false,
      autoWebview: true,
      fullReset: false,
      platformName: 'ios',
      platformVersion: '11.1',
      deviceName: 'iPhone Simulator',
      app: path.resolve(__dirname, 'platforms/ios/build/emulator/MyPolicy.app'),
    },
  },
};
