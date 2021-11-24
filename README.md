# nodeboot web security starter

Simple npm package to add a simple login feature to any express web application (not api or microservice)

# Coverage

![https://i.ibb.co/SwqG3sx/coverage.png](https://i.ibb.co/SwqG3sx/coverage.png)

# Requirements

- nodejs >= 10

# How it works?

If you have a express application which works fine

```
const express = require('express');
const app = express();
//here your custom express logic
```

but there is no login feature, if you add the following lines after the express instance and before your custom routes

```
const LoginProvider = require('nodeboot-web-security-starter').DefaultLoginProvider;
var loginProvider = new LoginProvider({express: app});
defaultLoginProvider.configure();
```

and these variables (username=password):

```
export USER_jane=changeme
```

after the restart, your express application will prompt a minimal login when anyone try to access it.

the credentials are:

- user: jane
- password: changeme

That's all.

# Advanced configurations

## Material Theme

For simple login, you can use the material theme

```
var loginProvider = new LoginProvider({
  express: app,
  theme: "material"
});
```

## Microsoft Login

As we know, microsoft uses oauth2 protocol for its login. Being more specific, microsfot uses the Authorization Grant Flow (oauth2). For this, the following parameters are required:

- base url: http://localhost:8080
- callback url: http://localhost:8080/microsoft/auth/callback
- logout ur: http://localhost:8080/logout

Then to obtain a **client id and secret** you should create an [application](https://apps.dev.microsoft.com/#/appList) on microsoft following this [guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app). Microsoft and other clouds, will ask you for previous listed parameters (base url, callback and logout)

After that change a little bit your configuration:

```
const MicrosoftLoginProvider = require('nodeboot-web-security-starter').MicrosoftLoginProvider;

var loginProvider = new MicrosoftLoginProvider({
  express: app,
  baseUrl:"http://localhost:3000",
  microsoft:{
    clientId : "applicationidfrommicrosoft",
    clientSecret : "applicationsecretfrommicrosoft"
  }
});
defaultLoginProvider.configure();
```

> Note: In the azure console,

And these variables:

```
export AUTH_allowedUsers="jane@hotmail.com , kurt@outlook.com"
```

That's all. In the next restart, your web will be protected with microsoft login and just jane@hotmail.com or kurt@outlook.com could access.

## More configurations

[Wiki](/wiki)

# Unit Test


```
----------------------------|---------|----------|---------|---------|-------------------
File                        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------------------|---------|----------|---------|---------|-------------------
All files                   |     100 |      100 |     100 |     100 |                   
 common                     |     100 |      100 |     100 |     100 |                   
  EnvironmentHelper.js      |     100 |      100 |     100 |     100 |                   
  SessionHelper.js          |     100 |      100 |     100 |     100 |                   
 login/default              |     100 |      100 |     100 |     100 |                   
  DefaultLoginProvider.js   |     100 |      100 |     100 |     100 |                   
 login/microsoft            |     100 |      100 |     100 |     100 |                   
  MicrosoftLoginProvider.js |     100 |      100 |     100 |     100 |                   
 user                       |     100 |      100 |     100 |     100 |                   
  UserMemoryProvider.js     |     100 |      100 |     100 |     100 |                   
----------------------------|---------|----------|---------|---------|-------------------
Test Suites: 5 passed, 5 total
Tests:       43 passed, 43 total
Snapshots:   0 total
Time:        2.93 s
Ran all test suites.
```

# Roadmap

- resolve TODO:
- add roles
- database user provider instead memory


# Contributors

<table>
  <tbody>
    <td>
      <img src="https://avatars0.githubusercontent.com/u/3322836?s=460&v=4" width="100px;"/>
      <br />
      <label><a href="http://jrichardsz.github.io/">JRichardsz</a></label>
      <br />
    </td>    
  </tbody>
</table>
