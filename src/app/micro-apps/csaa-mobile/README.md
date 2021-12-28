TODO: Add Travis build status

# Mobile MyPolicy (Micro App)

This repository contains code for implementing a mobile application that provides functionality similar to MyPolicy. The implementation uses the Ionic framework v5, which is based on Angular and allows for building both an IoS and Android specific mobile app by writing a singular code base.

## Content

- Introduction
- Setup environment
- Micro app setup
- Rollbar
- Further development
  - Dev notes
  - Working with named routes
  - New Styles
  - Theme Swapabble Icon
  - Releasing the NPM package
  - Lib pdf.js customization

## Introduction

### This ionic app is intended to run as a "Micro App". This means for production it will be rendered as an NPM module inside of another Ionic App. In Mobile Mypolicy's case, this is the MWG club app that will run inside of AAA National Ionic App. The app is run in standalone for local development and QA purposes.

## Setup Environment

### Basic Ionic setup

- Setup both Android and iOS dev environments (Android Studio & Xcode)
- Install Node.js (recommended: use [nvm](https://github.com/creationix/nvm) to install)
- Install the Ionic CLI, Cordova CLI, and iOS controls (`npm install -g @ionic/cli cordova ios-sim ios-deploy native-run cordova-res`)
- Initialize an Ionic v5 app
- Configure `~/_core/services/config/config.ts` file as needed. This is where we set all API Keys and other env variables. You may ask a developer to get dev/QA env keys and variables.
- Install this micro app via npm `npm i @csaadigital/mobile-mypolicy -S`
- If no error occurs, you are good to go with the commands below

## Micro app setup

Please refer to the [integration documentation](./INTEGRATE.md).

## Rollbar error logging

First set the `CSAA_ROLLBAR_UPLOAD_TOKEN` environment variable to the access token value from Rollbar project settings.
You can add this to your bash/zsh profile file, like this:

```
export CSAA_ROLLBAR_UPLOAD_TOKEN=INSERT_TOKEN
```

From the project's root folder, run build command with the `--source-map` flag to generate the minified scripts together with the source maps into the `www` folder.

### Production upload

From the project's root folder, run the upload script after build succeeded:

```bash
node ./node_modules/@csaadigital/mobile-mypolicy/source-map-upload.js --prod
```

### Development / QA upload (debug)

On your local machine, you need to run without the `--prod` flag:

```
node ./source-map-upload.js
```

This uploads the source maps under a version number with debug suffix like `5.3.0-12-debug-1`, `5.3.0-12-debug-2`, ... `5.3.0-12-debug-n`
Debug number needs to be manually incremented to distinguish between build. However, it's reset automatically to "0" with every version change (node set-version.js "X.X.X").

> Important! The codeVersion sent with error report needs to match the codeVersion used to upload source maps. This means that if app was built for production, source map needs to be uploaded with the `--prod` flag since the application already will send error reports with codeVersion `5.3.0-12` and not `5.3.0-12-debug-n`.
>
> Why do we even need the `-debug-n` suffix since we are setting rollbarEnvironment when reporting errors? At this time - during source maps upload, we aren't able to specify which environment the source maps are for.

## Further development

### Dev notes on some design decisions

Since our micro-app would be embedded into a parent app;

- We try to avoid module conflicts by prefixing our module names with csaa. For example: `CsaaAuthModule` since there may be an `LoginModule` in parent app. AT the moment, this issue is only available with modules so our components can take the best reasonable name. For example `LoginPage` without the need for a prefix. However, it'll be good practice to prefix the component selector with `csaa` for example `@Component({selector: 'app-csaa-login'})`
- `BootstrapGuard` ensures the micro-app initialization process completes before the first navigation. So if there are functions that needs to run before the first navigation in the micro-app, then that function is responsible for checking if the configs/dependencies it requires are ready. It is recommended to add `BootstrapGuard` to all routes registered in `~/csaa-app-routing.module.ts` module.

### Working with named routes

First define route name and path in `src/app/micro-apps/csaa-mobile/route-names.config.ts`
for example

```js
export const config = {
  name: 'csaa.home',
  path: 'csaa',
  children: [
    // Optional
    {
      name: 'csaa.auth',
      path: 'auth',
    },
  ],
};
```

where name is friendly route name that can easily be remembered by thinking of some concatenation pattern, path is the url friendly link (relative to parent route) while children are the (optional) descendants of this route.

Next we update the routes definitions in our routing modules from:

```typescript
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Note that CsaaAppRoutingModule parent imports these routes under the path '/csaa'
const routes: Routes = [
  {
    path: '', // Will then become /csaa
    loadChildren: () => import('./csaa-home/csaa-home.module').then((m) => m.CsaaHomePageModule),
  },
  {
    path: 'auth', // Will become /csaa/auth
    loadChildren: () => import('./auth/csaa-auth.module').then((m) => m.CsaaAuthModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaAppRoutingModule {}
```

to look like below with our custom typing and enhanced RouterModule:

```typescript
import { NgModule } from '@angular/core';
import { AppRoutes } from '@app/interfaces';
import { AppRouterModule } from '@app/router';

// `AppRouterModule.forChild` will add the "path" property once there is a "isGroupIndex" or "name" property in the route definition.
const routes: AppRoutes = [
  {
    isGroupIndex: true, // Same as {path: ''}
    loadChildren: () => import('./csaa-home/csaa-home.module').then((m) => m.CsaaHomePageModule),
  },
  {
    name: 'csaa.auth',
    loadChildren: () => import('./auth/csaa-auth.module').then((m) => m.CsaaAuthModule),
  },
];

@NgModule({
  imports: [AppRouterModule.forChild(routes)],
  exports: [AppRouterModule],
})
export class CsaaAppRoutingModule {}
```

At this point, instead of constructing complex route paths inside our app, we easily get the fullPath of a route using the RouterService by simply knowing the name of the route.
For example, to get the auth route:

```typescript
this.routerService.fullPath('csaa.auth'); // 'csaa/auth'
```

Or for some other route defined as follows:

```typescript
export const config = [
  {
    name: 'csaa.claims',
    path: 'csaa/claims',
    children: [
      {
        name: 'csaa.claim',
        path: ':claimId',
        children: [
          {
            name: 'csaa.claim.documents',
            path: 'documents',
            children: [
              {
                name: 'csaa.claim.document',
                path: ':documentId',
              },
            ],
          },
        ],
      },
    ],
  },
];

// src/app/micro-apps/csaa-mobile/_core/services/router/router.service.ts
this.routerService.fullPath('csaa.claim.document', {
  claimId: 12345,
  documentId: 67890,
}); // 'csaa/claims/12345/documents/67890'
```

> If you need only one of the routerService methods and can confirm it's available in the RouterHelpers, then a quick approach is to set that as a property to the class.
> MyPage class => `public readonly route = RouterHelpers.getRoutePath;` MyPage html => `<a href="#" [routerLink]="route('csaa.auth')">Log in</a>`

**IMPORTANT UPDATE:**
We encountered issues with named routes when loading the micro app from a main app. To fix this, in addition to providing a route name during configuration we're now providing the path as well.

```typescript
// As an example, this:
const routes: AppRoutes = [
  {
    isGroupIndex: true, // Same as {path: ''}
    loadChildren: () => import('./csaa-home/csaa-home.module').then((m) => m.CsaaHomePageModule),
  },
  {
    name: 'csaa.auth',
    loadChildren: () => import('./auth/csaa-auth.module').then((m) => m.CsaaAuthModule),
  },
];

// ... becomes
const routes: AppRoutes = [
  {
    isGroupIndex: true, // Same as {path: ''}
    path: '',
    loadChildren: () => import('./csaa-home/csaa-home.module').then((m) => m.CsaaHomePageModule),
  },
  {
    name: 'csaa.auth',
    path: 'auth',
    loadChildren: () => import('./auth/csaa-auth.module').then((m) => m.CsaaAuthModule),
  },
];

// Every other setting/usage works as before
```

### New Styles (MWG)

To create a new styleset for another club, a new folder was created inside `~/_scss/theme` called `mwg` and inside that folder, two more files called: `mwg.scss` and `_variables.scss`. In those files are all the changes needed for the layout of MWG. This same method can be applied to other clubs. After creating you must:

1.  Import `mwg.scss` on `~/_scss/main.scss`
2.  On every screen, we add the classname to the main content `<ion-content [ngClass]="['csaa', currentTheme]">`, the value of `currentTheme` is a string that distinguishes one theme from another.
3.  The value of `currentThem` must match the name of the root class wrapping all css definitions in `mwg.scss`
4.  This classname is managed by `config.service.ts`, where we current them is set.

### Theme Swapabble Icon

It was created a component named `~/_core/ui-kits/theme-icon/theme-icon.component.ts`to handle the policy type icons for multiple themes. The new icons must be placed on `~/assets/vectors` with a prefix, like `mwg-`. The component gets the current theme `config.service.ts` and adds the theme as the image path prefix.

### Releasing the NPM package for MWG integrated build

#### Access to npmjs.org

First of all to publish you need to have access to the npm org.

#### Publish to NPM

Start with manually edit package.json and package-lock.json both in root and in `src/app/micro-apps/csaa-mobile` to bump NPM version.

To make sure that we have dependencies aligned we should go through these steps:

1.  Clone the repository to separate directory
1.  Navigate to `src/app/micro-apps/csaa-mobile` in this new place where you cloned the repo
1.  Get the package.json in sync between the root and `src/app/micro-apps/csaa-mobile`
1.  run `npm install` in the `src/app/micro-apps/csaa-mobile` directory
1.  commit changes and push them to the remote (your feature/fix branch)
1.  pull in your original clone of the repository

That way you'll avoid breaking your local run config of the app.

Then go through this publish process:

```
npm login # follow instructions to log in
cd src/app/micro-apps/csaa-mobile # go to micro-app directory
npm publish
```
