const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080 ;
const DefaultLoginProvider = require('nodeboot-web-security-starter').DefaultLoginProvider;

var defaultLoginProvider = new DefaultLoginProvider({
  express: app,
  usersDataSource: {
    envKey : "USER_"
  },
  title: "Acme",
  signinHtmlTheme : "material"
});
defaultLoginProvider.configure();

app.use('/',
  express.static(path.join(__dirname, "site" || proces.env.SITE_FOLDER)),
);
app.listen(port, () => console.log(`server is listening on port ${port}!`));
