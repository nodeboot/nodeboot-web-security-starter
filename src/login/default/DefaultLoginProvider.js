const fs = require('fs');
const html = require('html-escaper');
const path = require('path');
const bodyParser = require('body-parser');
const SessionHelper = require('../../common/SessionHelper.js');
const uuid = require('uuid');
const UserMemoryProvider = require('../../user/UserMemoryProvider.js');

function DefaultLoginProvider(options){

  this.options = options;
  this.userMemoryProvider = new UserMemoryProvider(this.options.usersDataSource);
  this.allowedThemes = ['material','minimal'];

  this.configure = () => {

    this.options.signinRoute = (typeof this.options.signinRoute === 'undefined' ? "/signin" : html.escape(this.options.signinRoute));
    this.options.signinActionRoute = (typeof this.options.signinActionRoute === 'undefined' ? "/signin" : html.escape(this.options.signinActionRoute));
    this.options.logoutRoute = (typeof this.options.logoutRoute === 'undefined' ? "/logout" : html.escape(this.options.logoutRoute));

    this.options.title = (typeof this.options.title === 'undefined' ? "" : html.escape(this.options.title));

    if(typeof this.options.signinHtmlPath !== 'undefined'){
      this.signinHtmlPath = path.normalize(this.options.signinHtmlPath);
    }else{
      let theme = this.allowedThemes.indexOf(this.options.signinHtmlTheme) < 0 ? "minimal.html" : html.escape(this.options.signinHtmlTheme)+".html";
      this.signinHtmlPath = path.join( __dirname, theme);
    }

    if(!SessionHelper.hasValidSession(this.options.express)){
      const session = require('express-session');
      this.options.express.use(session({
        secret: uuid.v4(),
        resave: true,
        saveUninitialized: true,
        cookie: {
          secure: false,
          maxAge: (45 * 60 * 1000)
        }
      }));
    }else{
      console.log("session is already configured");
    }

    this.options.express.use(bodyParser.urlencoded({ extended: false }))
    this.options.express.use(bodyParser.json());
    this.options.express.use(ensureAuthenticationMiddleware());
    this.options.express.get(this.options.signinRoute, showSigninFormRoute);
    this.options.express.post(this.options.signinActionRoute, performSigninRoute);
    this.options.express.get(this.options.logoutRoute, performLogoutRoute);
  }

  var ensureAuthenticationMiddleware = () => {
    return (req, res, next) => {
      if(req.url.startsWith(this.options.signinRoute) || req.url.startsWith(this.options.signinActionRoute)
        || req.url.startsWith(this.options.logoutRoute)){
        return next();
      }
      //TODO: jest coverage warn this line
      //there is no option to session be null if configure() was called
      //also if it is not called, error should not throwed because user does not want to use this library
      // if(typeof req.session === 'undefined'){
      //   return res.status(401).send("Internal Error: 401");
      // }
      if(typeof req.session['auth_user'] === 'undefined'){
        res.type("text/html")
        res.status(401);
        return res.send(`You are not allowed to access this page. Click <a href="${this.options.signinRoute}">here</a> to login`);
      }
      //is not a login request (endpoint or asset) and exist a valid session
      next();
    }
  }

  var showSigninFormRoute = (req, res, next) => {
    var login_message = req.session['login.message'] || "";
    console.log("message to show on login: "+login_message);
    if(typeof this.defaultSigninHtml === 'undefined'){
      fs.readFile(this.signinHtmlPath, 'utf8' , (err, html) => {
        //err never will be null because if theme is unknown, a default is set
        html = html.replace(/@title@/g, this.options.title)
        this.defaultSigninHtml = html;
        html = html.replace("@login_message@", login_message);
        res.type("text/html")
        res.send(html);
      })
    }else{
      let html = this.defaultSigninHtml.replace("@login_message@", login_message);
      res.type("text/html")
      res.send(html);
    }

  };

  var performSigninRoute = (req, res, next) => {

    if (typeof req.body.username === 'undefined' || typeof req.body.password === 'undefined') {
      console.log("User or password incorrect: "+req.body.username);
      req.session['login.message'] = "User or password incorrect";
      return res.redirect(this.options.signinRoute);
    }

    let storedUser = this.userMemoryProvider.findUserForDefaultLogin(req.body.username);

    if (typeof storedUser === 'undefined' || req.body.password !== storedUser.password) {
      console.log("user don't exist on env or password is incorrect");
      req.session['login.message'] = "User or password incorrect";
      return res.redirect(this.options.signinRoute);
    }else {
      //user, password and roles are validated!!
      req.session['auth_user'] = storedUser;
      res.redirect("/");
    }
  };

  var performLogoutRoute = (req, res, next) => {
    req.session.destroy((err)=>{
      return res.redirect(this.options.signinRoute);
    });
  };

}

module.exports = DefaultLoginProvider;
