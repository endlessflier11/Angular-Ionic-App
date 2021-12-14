import { NEVER } from 'rxjs';
import { Platforms } from '@ionic/core';

export class PlatformMock {
  /**
   *
   * | Platform Name   | Description                        |
   * |-----------------|------------------------------------|
   * | android         | on a device running Android.       |
   * | cordova         | on a device running Cordova.       |
   * | ios             | on a device running iOS.           |
   * | ipad            | on an iPad device.                 |
   * | iphone          | on an iPhone device.               |
   * | phablet         | on a phablet device.               |
   * | tablet          | on a tablet device.                |
   * | electron        | in Electron on a desktop device.   |
   * | pwa             | as a PWA app.                      |
   * | mobile          | on a mobile device.                |
   * | mobileweb       | on a mobile device in a browser.   |
   * | desktop         | on a desktop device.               |
   * | hybrid          | is a cordova or capacitor app.     |
   *
   */
  is = jest.fn((platformName: Platforms) => ['mobileweb', 'desktop'].includes(platformName));
  ready = jest.fn().mockResolvedValue(Promise.resolve(true));
  backButton = {
    subscribeWithPriority: jest.fn().mockReturnValue(NEVER),
  };
}
