TODO: Add Travis build status

# Mobile MyPolicy (Standalone)

ReadMe for Micro App can be found [here](./src/app/micro-apps/csaa-mobile/README.md)

This repository contains code for implementing a mobile application that provides functionality similar to MyPolicy web. The implementation uses the Ionic framework v5, which is based on Angular and allows for building both an iOS and Android specific mobile app by writing a singular code base.

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
| 5.9.0   | MWG(2021, Dec 08) | Capacitor. Apple Wallet                            | v2          |
| 5.9.1   | ACA(--)           | Capacitor. Apple Wallet                            | v2          |

# Setup Environment

## Basic Ionic setup

- Setup both Android and iOS dev environments ([Android Studio](https://ionicframework.com/docs/developing/android) & [Xcode](https://ionicframework.com/docs/developing/ios))
- Install Node.js from `.nvmrc` version (recommended: use [nvm](https://github.com/creationix/nvm) to install)
- Make sure that you have NPM in version 6: `npm i -g npm@latest-6`, cause NPM 7 will not work with CI and AAA national cordova plugins
- Install the Ionic CLI, Cordova CLI, and iOS controls (`npm install -g @ionic/cli ios-sim ios-deploy native-run`)
- Clone this repository
- The file `.npmrc` refers to some environment tokens `AAA_MOBILE_v5_NPM_TOKEN` and `AAA_IONIC_REGISTRY_TOKEN`.
  - This is necessary because we rely on a few npm libraries from AAA's private npm repository(`@aaa-mobile`) and an access token is required for us to install from it.
  - contact a project maintainer to get access to these tokens and set it as the environment variables `AAA_MOBILE_V5_NPM_TOKEN` and `AAA_IONIC_REGISTRY_TOKEN` on your system.
- Run `npm i` from the project root
- If no error occurs, you are good to go with the commands below

# Start the app

Starting the app for local development:

```bash
npm start
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

### Build and run on iOS

```
npm run on:ios
```

### Build and run on Android

```
npm run on:android
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

## Further reading on

For more information about possible fastlane commands _like adding new devices (UDIDs)_, see [Fastlane README](fastlane/README.md).

# Releasing the NPM package for MWG integrated build

Please follow the release guide [here](./src/app/micro-apps/csaa-mobile/README.md)

# How to integrate CSAA microapp into Club Applications?

Please refer to the [integration documentation](./src/app/micro-apps/csaa-mobile/INTEGRATE.md).
