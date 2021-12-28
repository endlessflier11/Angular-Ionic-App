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
