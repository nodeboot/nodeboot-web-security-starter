const fs = require('fs');
const html = require('html-escaper');
const path = require('path');
const bodyParser = require('body-parser');
const SessionHelper = require('../../common/SessionHelper.js');
const uuid = require('uuid');
const UserMemoryProvider = require('../../user/UserMemoryProvider.js');
const passport = require('passport');

function MicrosoftLoginProvider(options) {

  this.MicrosoftStrategy = require('passport-microsoft').Strategy;
  this.options = options;
  this.userMemoryProvider = new UserMemoryProvider();

  this.configure = () => {

    this.options.signinRoute = (typeof this.options.signinRoute === 'undefined' ? "/signin" : html.escape(this.options.signinRoute));
    this.options.callbackRoute = (typeof this.options.callbackRoute === 'undefined' ? "/microsoft/auth/callback" : html.escape(this.options.callbackRoute));
    this.options.logoutRoute = (typeof this.options.logoutRoute === 'undefined' ? "/logout" : html.escape(this.options.logoutRoute));

    if (typeof this.options.baseUrl === 'undefined') {
      throw Error("baseUrl is required to enable Microsoft authentication");
    }

    if (typeof this.options.microsoft === 'undefined') {
      throw Error("Microsoft settings is required");
    }
    if (typeof this.options.microsoft.clientId === 'undefined') {
      throw Error("Microsoft clientId is required");
    }
    if (typeof this.options.microsoft.clientSecret === 'undefined') {
      throw Error("Microsoft clientSecret is required");
    }

    if (!SessionHelper.hasValidSession(this.options.express)) {
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
    } else {
      console.log("session is already configured");
    }

    this.options.express.use(bodyParser.urlencoded({
      extended: false
    }))
    this.options.express.use(bodyParser.json());
    // this.options.express.use(this.options.express.router);

    passport.serializeUser(function(user, done) {
      done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
      done(null, obj);
    });

    passport.use(new this.MicrosoftStrategy({
        clientID: this.options.microsoft.clientId,
        clientSecret: this.options.microsoft.clientSecret,
        callbackURL: this.options.baseUrl + this.options.callbackRoute,
        scope: ['user.read']
      },
      function(accessToken, refreshToken, profileeee, done) {
        return done(null, profileeee);
      }
    ));

    this.options.express.use(passport.initialize());
    this.options.express.use(passport.session());

    this.options.express.use(ensureAuthenticationMiddleware());
    /* istanbul ignore next */
    this.options.express.get(this.options.signinRoute, passport.authenticate('microsoft'), function(req, res) {
      // The request will be redirected to Google for authentication, so this
      // function will not be called.

      //TODO: This function is required but it is never called
      //Solution: dont apply passport.authenticate('microsoft') to this function and instead
      //if user is not authenticated call directly to redirect.
      //var location = this._oauth2.getAuthorizeUrl(params);
      //this.redirect(location);
      //passport-oauth2/lib/strategy.js line: 213
      //pitifully, passport does not expose this feature
    });
    this.options.express.get(this.options.callbackRoute, passport.authenticate('microsoft'), performCallbackRoute);
    this.options.express.get(this.options.logoutRoute, performLogoutRoute);
  }

  var ensureAuthenticationMiddleware = () => {
    return (req, res, next) => {

      if (req.url.startsWith(this.options.signinRoute) || req.url.startsWith(this.options.callbackRoute) ||
        req.url.startsWith(this.options.logoutRoute)) {
        return next();
      }
      if (typeof req.session['auth_user'] === 'undefined') {
        res.type("text/html")
        res.status(401);
        return res.send(`You are not allowed to access this page: 401100 Click <a href="${this.options.signinRoute}">here</a> to login`);
      }
      //is not a login request (endpoint or asset) and exist a valid session
      next();
    }
  }

  var performCallbackRoute = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send(`You are not allowed to access this page : 401500. Click <a href="${this.options.signinRoute}">here</a> to login`);
    }

    var sessionEmailFromOauth2Provider;
    try {
      sessionEmailFromOauth2Provider = req.user.emails[0].value;
    } catch (err) {
      console.log("mail cannot be obtained from microsfot provider. Exptected: req.user.emails[0].value");
    }

    if (typeof sessionEmailFromOauth2Provider === 'undefined') {
      return res.status(401).send(`You are not allowed to access this page : 401501. Click <a href="${this.options.signinRoute}">here</a> to login`);
    }

    //search without domain
    let existUser = this.userMemoryProvider.isUserAllowedForOauth2Login(sessionEmailFromOauth2Provider.trim());

    if (typeof existUser === 'undefined' || existUser === false) {
      return res.status(403).send(`You are not allowed to access this page : 403100. Click <a href="${this.options.signinRoute}">here</a> to login`);
    } else {
      //user exist on microsoft and on memory store !!
      req.session['auth_user'] = existUser;
      res.redirect("/");
    }
  };

  var performLogoutRoute = (req, res, next) => {
    req.logout();
    req.session.destroy((err) => {
      return res.send(`You have successfully logged out!. Click <a href="${this.options.signinRoute}">here</a> to login`);
    });
  };

}

module.exports = MicrosoftLoginProvider;
