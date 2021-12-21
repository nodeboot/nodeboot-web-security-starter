const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080 ;
const MicrosoftLoginProvider = require('nodeboot-web-security-starter').MicrosoftLoginProvider;


var loginProvider = new MicrosoftLoginProvider({
  express: app,
  baseUrl: process.env.BASE_URL,
  usersDataSource: {
    envKey : "ALLOWED_USERS"
  },
  microsoft: {
    clientId: process.env.LOGIN_OAUTH2_CLIENT_ID,
    clientSecret: process.env.LOGIN_OAUTH2_CLIENT_SECRET
  }
});

loginProvider.configure();

app.use('/',
  express.static(path.join(__dirname, "site" || proces.env.SITE_FOLDER)),
);
app.listen(port, () => console.log(`server is listening on port ${port}!`));
