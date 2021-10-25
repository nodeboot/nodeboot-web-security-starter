# nodeboot web security starter

Simple npm package to add a simple login feature to any express web application (not api or microservice)

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
const DefaultLoginProvider = require('nodeboot-web-security-starter').DefaultLoginProvider;
var defaultLoginProvider = new DefaultLoginProvider({express: app});
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

Coming soon.

# Roadmap

- todos
- add microsoft login
