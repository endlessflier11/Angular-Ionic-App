TODO: Add Travis build status

# Mobile MyPolicy (Standalone)

ReadMe for Micro App can be found [here](./src/app/micro-apps/csaa-mobile/README.md)

This repository contains code for implementing a mobile application that provides functionality similar to MyPolicy. The implementation uses the Ionic framework v5, which is based on Angular and allows for building both an IoS and Android specific mobile app by writing a singular code base.

# Implementation of CSAA Mobile Mypolicy

## This ionic app is intended to run as a "Micro App". This means for production it will be rendered as an NPM module inside of another Ionic App. In Mobile Mypolicy's case, this is the MWG club app that will run inside of AAA National Ionic App. The app is run in standalone for local development and QA purposes.

# Releases

| Version | Club(Date)        | Main features                                      | API Version |
| ------- | ----------------- | -------------------------------------------------- | ----------- |
| 5.0.0   | MWG(2020, Aug 26) | Ionic v5                                           | v1          |
| 5.2.1   | MWG(2020, Nov 24) | Deeplink                                           | v1          |
| 5.3.2   | MWG(2021, Feb 04) | New Electronic ID cards, AutoPay features          | v1          |
| 5.4.0   | MWG(2021, Feb 25) | California release, Service Locator                | v1          |
| 5.5.0   | MWG(2021, May 20) | New State Management                               | v1          |
| 5.5.5   | ACA(2021, Jun 28) | ACA Integration, Nationals webview for documents   | v1          |
| 5.6.5   | MWG(2021, Aug 04) | Documents                                          | v1          |
| 5.6.8   | ACA(2021, Sep 02) | Documents + Extra Webview Cookies api (All states) | v1          |
| 5.7.2   | MWG(2021, Sep 29) | Paperless preferences, Bills, x-api-key header     | v2          |
| 5.7.3   | ACA(2021, Oct 07) | Paperless preferences, Bills, x-api-key header     | v2          |
| 5.8.0   | MWG(2021, Oct 27) | Autopay Installment Fee Savings                    | v2          |
| 5.8.0   | ACA(2021, Nov 18) | Autopay Installment Fee Saving                     | v2          |

# Setup Environment

## Basic Ionic setup

- Setup both Android and iOS dev environments (Android Studio & Xcode)
- Install Node.js from `.nvmrc` versuib (recommended: use [nvm](https://github.com/creationix/nvm) to install)
- Make sure that you have NPM in version 6: `npm i -g npm@latest-6`, cause NPM 7 will not work with CI and AAA national cordova plugins
- Install the Ionic CLI, Cordova CLI, and iOS controls (`npm install -g @ionic/cli cordova ios-sim ios-deploy native-run cordova-res`)
- Clone this repository
- Create a `.env` file in the project root. This is how we emulate the environment of the wrapper National app and all API Keys and other env variables will need to be specified here. Ask a developer for theirs to get some of the dev/QA env key variables.
- Create a `.npmrc` file in the project root containing the following:
  ```
  //registry.npmjs.org/:_authToken=\${AAA_MOBILE_v5_NPM_TOKEN}
  ```
  - This is necessary because we rely on a few npm libraries from AAA's private npm repository(`@aaa-mobile`) and an access token is required for us to install from it.
  - contact a project maintainer to get access to the token and set it as the environment variable `AAA_MOBILE_V5_NPM_TOKEN` on your system.
- Run `npm i` from the project root
- Run `ionic cordova prepare` from the project root to prepare all cordova dependencies
- If no error occurs, you are good to go with the commands below

# Start the app

Starting the app for local development:

```bash
npm run start:dev
```

Starting with a AAA club theme set as default:

```bash
CSAA_APP_THEME=mwg npm run start:dev
```

# Setup Fastlane builds

## Prerequisites

### Ruby

You'll need a ruby environment. It's recommended to use [RVM](https://rvm.io).

1.  On a Mac you'll need to install GPG first, ex: https://gpgtools.org
2.  Then install RVM by running:

```bash
gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
\curl -sSL https://get.rvm.io | bash -s stable
```

3.  If you just installed RVM, then install Ruby as well:

```
rvm use --install
```

4.  Install cocoapods

```
gem instal cocoapods
```

## Set environment variables

fastlane requires some environment variables set up to run correctly. In particular, having your locale not set to a UTF-8 locale will cause issues with building and uploading your build. In your shell profile add the following lines:

```
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
```

You can find your shell profile at ~/.bashrc, ~/.bash_profile, ~/.profile or ~/.zshrc depending on your system.
After setting that source your profile file, ex:

```
source ~/.zshrc
```

## Install fastlane

Run from the project root:

```
bundle install
```

### Create keychain

On your macOS device run:

```
bundle exec fastlane setup_keychain
```

## Get signing certificates

Make sure that you have access to the `git@csaa.github.com:aaa-ncnu-ie/csaa-ins-certificates.git` repository.

## Get password for shared Apple ID

When you're running the build you will be asked about the password for our shared Apple ID. You'll need to get it from Brant or someone with access to the enterprise Apple account.

## Set FastLane environment variables

Get the API Key from App Center or Brant. Get the passphrase for Match.
THen add these to your shell profile:

```
export CSAA_APP_CENTER_API_TOKEN=[THE_KEY]
export CSAA_MATCH_PASSPHRASE=[THE_PASSWORD]
```

You can find your shell profile at ~/.bashrc, ~/.bash_profile, ~/.profile or ~/.zshrc depending on your system.
After setting that source your profile file, ex:

```
source ~/.zshrc
```

## Release new QA build

### Update version of the app

Bump the version of the app running the following command:

```
node set-version.js [versionName]
```

or search and replace all instances of the [current version](https://github.com/aaa-ncnu-ie/ds-mobile-mypolicy-hybrid-app/blob/dev/package.json#L3) with the new version.

### Build iOS

```
npm run qa:ios
```

### Build Android

```
npm run qa:android
```

### Generate a key and keystore

1.  Use the following command to initiate keytore and certificate generation:
    `keytool -genkey -v -keystore keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias mypolicy`
1.  Open the Android project located in `./platforms/android` in Android Studio.
    **IMPORANT**:
    During the generation of certificate fill your company details for the certificate fields. That is only relevant for upload – not for release signing.
1.  Export the certificate:
    `keytool -export -rfc -alias mypolicy -file android_upload_certificate.pem -keystore keystore.jks`
1.  Backup your `keystore.jks` file and store passwords safely. If you loose this, then there's a painful process that includes contacting Google's support (see: [Create a new upload key](https://support.google.com/googleplay/android-developer/answer/7384423)).

### Run the build

You need to set the keystore and private key passwords in environment variables before running the command. These variables are:

```
CORDOVA_ANDROID_KEYSTORE_PASSWORD
CORDOVA_ANDROID_KEY_PASSWORD
```

You can do it immediately before running the build command:

```
CORDOVA_ANDROID_KEYSTORE_PASSWORD=your_keystore_password CORDOVA_ANDROID_KEY_PASSWORD=your_key_password npm run prod:android
```

Remember to replace the passwords with the ones you set in **Generate a key and keystore** instructions.

## Further reading on

For more information about possible fastlane commands _like adding new devices (UDIDs)_, see [Fastlane README](fastlane/README.md).

# Releasing the NPM package for MWG integrated build

Please follow the release guide [here](./src/app/micro-apps/csaa-mobile/README.md)

# How to integrate CSAA microapp into Club Applications?

These are the changes required to integrate CSAA microapp into a Club application.

## Routing to CSAA App Module:

```javascript
  const routes: Routes = [
    {
      path: 'csaa',
      loadChildren: () =>
        import('@csaadigital/mobile-mypolicy/csaa-app.module').then((m) => m.CsaaAppModule),
    },
    (...)
  ]
```

## Setup CSAA microapp at bootstrap:

Clubs app must use `ConfigService` to synchronize the initialization of CSAA microapp with its own bootstrap process. When ready, the club app should call `ConfigService.setup(...)` method, providing runtime environment, Theme to be used, and a _setup configuration object_, as follows:

```javascript
import { ConfigService, CsaaConfigEnv, CsaaTheme } from '@csaadigital/mobile-mypolicy';

this.platform.ready().then(() => {
  this.configService.setup(
    environment.production ? CsaaConfigEnv.PROD : CsaaConfigEnv.QA,
    CsaaTheme.ACA,
    {
      moduleRootPath: '/mobile/aca/csaa',
      nonInsuredRedirectTo: '/non-insured-page',
      showHomeHeader: true,
      homeBackButtonRedirectTo: '/',
      handleIgToken: true,
      clubCode: '212',
    }
  );
});
```

### Setup Configuration Object

| **key** _(type)_                                     | Description                                                                                                                                                                          | Default value                               |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| **moduleRootPath** _(string)_                        | Full path to `@csaadigital/mobile-mypolicy/csaa-app.module`                                                                                                                          |
| **nonInsuredRedirectTo** _(string)_                  | Full path to a Non Insured Page that will be used by `CsaaAuthGuard` to redirect the user to when the user is not logged in.                                                         |
| **nonInsuredRedirectToExternal** _(optional string)_ | Full path to a Non Insured External Page that will be used by `CsaaAuthGuard` to redirect the user to when the user is not logged in. The link will be opened in National's WebView. | https://www.aaa.com/appsmartphoneinsurance9 |
| **showHomeHeader** _(optional boolean)_              | If _true_ the CSAA Home Page will show a header with a back button and a message "Hello _insured_first_name_"                                                                        | _false_                                     |
| **homeBackButtonRedirectTo** _(optional string)_     | Full path to route the user to when the back button in the header of CSAA Home Page is pressed.                                                                                      | _'/'_                                       |
| **handleIgToken** _(optional boolean)_               | If _true_ the CSAA module will handle the request of Okta Access Token from Mobile MyPolicy translator service.                                                                      | _false_                                     |
| **clubCode** _(optional string_)                     | Set appropriate club code. This is necessary to redirect user to external url (**nonInsuredRedirectToExternal**) using National WebView                                              | _'005'_                                     |
| **zipCode** _(optional string_)                      | Set current zip code. This is necessary to redirect user to external url (**nonInsuredRedirectToExternal**) using National WebView                                                   | _null_                                      |

## Integrating Authentication:

For proper auth flow integration, `AuthService` provides two methods to be called on user login and logout. In order to provide the access token/authorization code to CSAA micro app, the club app will call `setAccessToken` as follow:

```javascript
import { AuthService as CsaaAuthService } from '@csaadigital/mobile-mypolicy';
```

### On LOGIN :

Set AAA Natcional Access Token

```javascript
    this.csaaAuthService
      .setAccessToken(
        { accessToken }
      )
      .subscribe(...);
```

### On LOGOUT :

Make sure to call `logout` method so the microapp can clean itself up.

```javascript
    this.csaaAuthService.logout().subscribe(...)
```

### Providing Dynamic Cookies to AAAN Webview:

It is possible to provide any additional cookie with dynamic value to the AAA National Webview opened by CSAA microapp:

```javascript
import { ConfigService } from '@csaadigital/mobile-mypolicy';
import { CookieJar } from '@aaa-mobile/cordova-plugin-aaa-mobile/dist/ngx/interfaces';

const cookies: CookieJar[] = [
  {
    domain: '.aaa.com',
    name: 'xyz',
    value: `123`,
  },
];
this.configService.setWebviewCookies(cookies);
```

## Adding styles

Import CSAA styles definition into `global.scss`:

```scss
@import '~@csaadigital/mobile-mypolicy/_scss/main';
```

## Copying static assets, fonts and images

In order to copy CSAA static assest to `assets/csaa-mobile` output directory, add to `angular.json` the configuration bellow:

```javascript
      (...)
        "build": {
          (...)
          "options": {
            (...)
            "assets": [
              (...),
              {
                "glob": "**/*",
                "input": "node_modules/@csaadigital/mobile-mypolicy/assets",
                "output": "assets/csaa-mobile"
              },
              (...)
            ]
```
