const http = require('http');
const express = require('express');
const request = require('supertest');
const session = require('express-session');
const MicrosoftLoginProvider = require('../../../src/login/microsoft/MicrosoftLoginProvider.js');
const ErrorNotAuthenticatedMockStrategy = require('./ErrorNotAuthenticatedStrategy.mock.js');
const ErrorNotValidMailMockStrategy = require('./ErrorNotValidMailStrategy.mock.js');
const SuccessMockStrategy = require('./SuccessStrategy.mock.js');

describe('MicrosoftLoginProvider.js', () => {
  let server;

  afterEach(() => {
    if (typeof server !== 'undefined') {
      server.close();
    }
  })

  it('missing microsoft settings: should show an error', async () => {
    const app = express();
    var loginProvider = new MicrosoftLoginProvider({
      express: app
    });
    try {
      loginProvider.configure();
      expect(true).toBe(false, "Exception not thrown when microsoft settings are missing");
    } catch (err) {
      expect(err.message).toBe("baseUrl is required to enable Microsoft authentication");
    };

    loginProvider = new MicrosoftLoginProvider({
      express: app,
      baseUrl: "localhost:3000"
    });
    try {
      loginProvider.configure();
      expect(true).toBe(false, "Exception not thrown when microsoft settings are missing");
    } catch (err) {
      expect(err.message).toBe("Microsoft settings is required");
    };

    loginProvider = new MicrosoftLoginProvider({
      express: app,
      baseUrl: "localhost:3000",
      microsoft: {}
    });
    try {
      loginProvider.configure();
      expect(true).toBe(false, "Exception not thrown when microsoft settings are missing");
    } catch (err) {
      expect(err.message).toBe("Microsoft clientId is required");
    };

    loginProvider = new MicrosoftLoginProvider({
      express: app,
      baseUrl: "localhost:3000",
      microsoft: {
        clientId: "foo"
      }
    });
    try {
      loginProvider.configure();
      expect(true).toBe(false, "Exception not thrown when microsoft settings are missing");
    } catch (err) {
      expect(err.message).toBe("Microsoft clientSecret is required");
    };
    loginProvider = new MicrosoftLoginProvider({
      express: app,
      baseUrl: "localhost:3000",
      microsoft: {
        clientSecret: "bar",
      }
    });
    try {
      loginProvider.configure();
      expect(true).toBe(false, "Exception not thrown when microsoft settings are missing");
    } catch (err) {
      expect(err.message).toBe("Microsoft clientId is required");
    };
  })
  it('user not authenticated: should not access to any route', async () => {
    const app = express();
    var loginProvider = new MicrosoftLoginProvider({
      express: app,
      baseUrl: "localhost:3000",
      microsoft: {
        clientId: "foo",
        clientSecret: "bar"
      }
    });
    loginProvider.configure();
    app.get('/', (req, res) => {
      return res.status(200).send('im the protected')
    });
    server = http.createServer(app);
    server.listen(0);
    const response = await request(app).get('/');
    expect(response.status).toBe(401);
    expect(response.text.startsWith("You are not allowed to access this page: 401100")).toBe(true);
  })

  it('user not authenticated on signin: should be redirected to microsoft', async () => {
    const app = express();
    var loginProvider = new MicrosoftLoginProvider({
      express: app,
      baseUrl: "localhost:3000",
      microsoft: {
        clientId: "foo",
        clientSecret: "bar"
      }
    });
    loginProvider.configure();
    server = http.createServer(app);
    server.listen(0);
    const response = await request(app).get('/signin');
    expect(response.status).toBe(302);
    expect(response.headers.location.startsWith("https://login.microsoftonline.com/common/oauth2/v2.0/authorize")).toBe(true);
  })

  it('user not authenticated: should not access to any resource != /login', async () => {
    const app = express();
    var loginProvider = new MicrosoftLoginProvider({
      express: app,
      baseUrl: "localhost:3000",
      microsoft: {
        clientId: "foo",
        clientSecret: "bar"
      }
    });
    loginProvider.configure();
    server = http.createServer(app);
    app.get('/protected', (req, res) => {
      res.status(200).send('im the protected')
    });
    server.listen(0);
    const response = await request(app).get('/protected');
    expect(response.status).toBe(401);
    expect(response.text.startsWith("You are not allowed to access this page")).toBe(true);

  })
  it('internal error on callback: should be show an error', async () => {

    const app = express();
    var loginProvider = new MicrosoftLoginProvider({
      express: app,
      baseUrl: "localhost:3000",
      microsoft: {
        clientId: "foo",
        clientSecret: "bar"
      }
    });
    //mock
    loginProvider.MicrosoftStrategy = ErrorNotAuthenticatedMockStrategy;

    loginProvider.configure();
    server = http.createServer(app);
    server.listen(0);

    var req = request(app).get('/microsoft/auth/callback');
    const callbackResponse = await req;
    expect(callbackResponse.status).toBe(401);
    expect(callbackResponse.text.startsWith("You are not allowed to access this page : 401500")).toBe(true);
  })
  it('invalid mail/user on callback: should show an error', async () => {

    const app = express();
    var loginProvider = new MicrosoftLoginProvider({
      express: app,
      baseUrl: "localhost:3000",
      microsoft: {
        clientId: "foo",
        clientSecret: "bar"
      }
    });
    //mock
    loginProvider.MicrosoftStrategy = ErrorNotValidMailMockStrategy;

    loginProvider.configure();
    server = http.createServer(app);
    server.listen(0);

    var req = request(app).get('/microsoft/auth/callback');
    const callbackResponse = await req;
    expect(callbackResponse.status).toBe(401);
    expect(callbackResponse.text.startsWith("You are not allowed to access this page : 401501")).toBe(true);
  })
  it('valid mail/user on callback without env user: should show an error', async () => {

    const app = express();
    var loginProvider = new MicrosoftLoginProvider({
      express: app,
      baseUrl: "localhost:3000",
      microsoft: {
        clientId: "foo",
        clientSecret: "bar"
      }
    });
    //mock
    loginProvider.MicrosoftStrategy = SuccessMockStrategy;

    loginProvider.configure();
    server = http.createServer(app);
    server.listen(0);

    var req = request(app).get('/microsoft/auth/callback');
    const callbackResponse = await req;
    expect(callbackResponse.status).toBe(403);
    expect(callbackResponse.text.startsWith("You are not allowed to access this page : 403100")).toBe(true);
  })
  it('valid mail/user on callback with env user: should access', async () => {
    process.env['AUTH_allowedUsers'] = "jane@microsoft.com";
    const app = express();
    var loginProvider = new MicrosoftLoginProvider({
      express: app,
      baseUrl: "localhost:3000",
      microsoft: {
        clientId: "foo",
        clientSecret: "bar"
      }
    });
    //mock
    loginProvider.MicrosoftStrategy = SuccessMockStrategy;
    loginProvider.configure();
    app.get('/', (req, res) => {
      return res.status(200).send('im the protected')
    });
    server = http.createServer(app);
    server.listen(0);

    var req = request(app).get('/microsoft/auth/callback');
    const callbackResponse = await req;
    expect(callbackResponse.status).toBe(302);
    expect(callbackResponse.headers.location).toBe("/");

    //get valid cookie
    var cookies = callbackResponse.headers['set-cookie'].pop().split(';')[0];
    const homeReq = request(app).get("/");
    // Set cookie to get saved user session
    homeReq.cookies = cookies;
    const response = await homeReq;
    expect(response.status).toBe(200);
    expect(response.text).toBe('im the protected');

  })

  it('valid mail/user on callback with env user and pre-existent session: should access', async () => {

    process.env['AUTH_allowedUsers'] = "jane@microsoft.com";
    const app = express();
    app.use(session({
      secret: "secret",
      resave: true,
      saveUninitialized: true,
      cookie: {
        secure: false,
        maxAge: (45 * 60 * 1000)
      }
    }));
    var loginProvider = new MicrosoftLoginProvider({
      express: app,
      baseUrl: "localhost:3000",
      microsoft: {
        clientId: "foo",
        clientSecret: "bar"
      }
    });
    //mock
    loginProvider.MicrosoftStrategy = SuccessMockStrategy;
    loginProvider.configure();
    app.get('/', (req, res) => {
      return res.status(200).send('im the protected')
    });
    server = http.createServer(app);
    server.listen(0);

    var req = request(app).get('/microsoft/auth/callback');
    const callbackResponse = await req;
    expect(callbackResponse.status).toBe(302);
    expect(callbackResponse.headers.location).toBe("/");

    //get valid cookie
    var cookies = callbackResponse.headers['set-cookie'].pop().split(';')[0];
    const homeReq = request(app).get("/");
    // Set cookie to get saved user session
    homeReq.cookies = cookies;
    const response = await homeReq;
    expect(response.status).toBe(200);
    expect(response.text).toBe('im the protected');
  })

  it('authenticated user, after logout : should show a logout message', async () => {
    process.env['AUTH_allowedUsers'] = "jane@microsoft.com";
    const app = express();
    var loginProvider = new MicrosoftLoginProvider({
      express: app,
      baseUrl: "localhost:3000",
      microsoft: {
        clientId: "foo",
        clientSecret: "bar"
      }
    });
    //mock
    loginProvider.MicrosoftStrategy = SuccessMockStrategy;
    loginProvider.configure();
    app.get('/', (req, res) => {
      return res.status(200).send('im the protected')
    });
    server = http.createServer(app);
    server.listen(0);

    var req = request(app).get('/microsoft/auth/callback');
    const callbackResponse = await req;
    expect(callbackResponse.status).toBe(302);
    expect(callbackResponse.headers.location).toBe("/");

    //get valid cookie
    var cookies = callbackResponse.headers['set-cookie'].pop().split(';')[0];
    const homeReq = request(app).get("/");
    // Set cookie to get saved user session
    homeReq.cookies = cookies;
    const response = await homeReq;
    expect(response.status).toBe(200);
    expect(response.text).toBe('im the protected');

    //perform logout
    var logoutReq = request(app).get('/logout')
    logoutReq.cookies = cookies;
    var logoutResp = await logoutReq;
    expect(logoutResp.status).toBe(200);
    expect(logoutResp.text.startsWith("You have successfully logged out")).toBe(true);
    expect(logoutResp.text.includes('href="/signin"')).toBe(true);
  })
  it('custom /signin route : should work', async () => {
    const app = express();
    var loginProvider = new MicrosoftLoginProvider({
      express: app,
      baseUrl: "localhost:3000",
      signinRoute: "/foo",
      microsoft: {
        clientId: "foo",
        clientSecret: "bar"
      }
    });
    loginProvider.configure();
    server = http.createServer(app);
    server.listen(0);
    const response = await request(app).get('/foo');
    expect(response.status).toBe(302);
    expect(response.headers.location.startsWith("https://login.microsoftonline.com/common/oauth2/v2.0/authorize")).toBe(true);
  })
  it('custom callback : should work', async () => {
    process.env['AUTH_allowedUsers'] = "jane@microsoft.com";
    const app = express();
    var loginProvider = new MicrosoftLoginProvider({
      express: app,
      baseUrl: "localhost:3000",
      callbackRoute: "/bar",
      microsoft: {
        clientId: "foo",
        clientSecret: "bar"
      }
    });
    //mock
    loginProvider.MicrosoftStrategy = SuccessMockStrategy;
    loginProvider.configure();
    app.get('/', (req, res) => {
      return res.status(200).send('im the protected')
    });
    server = http.createServer(app);
    server.listen(0);

    var req = request(app).get('/bar');
    const callbackResponse = await req;
    expect(callbackResponse.status).toBe(302);
    expect(callbackResponse.headers.location).toBe("/");

    //get valid cookie
    var cookies = callbackResponse.headers['set-cookie'].pop().split(';')[0];
    const homeReq = request(app).get("/");
    // Set cookie to get saved user session
    homeReq.cookies = cookies;
    const response = await homeReq;
    expect(response.status).toBe(200);
    expect(response.text).toBe('im the protected');
  })
  it('custom logout : should work', async () => {
    process.env['AUTH_allowedUsers'] = "jane@microsoft.com";
    const app = express();
    var loginProvider = new MicrosoftLoginProvider({
      express: app,
      baseUrl: "localhost:3000",
      logoutRoute: "/baz",
      microsoft: {
        clientId: "foo",
        clientSecret: "bar"
      }
    });
    //mock
    loginProvider.MicrosoftStrategy = SuccessMockStrategy;
    loginProvider.configure();
    app.get('/', (req, res) => {
      return res.status(200).send('im the protected')
    });
    server = http.createServer(app);
    server.listen(0);

    var req = request(app).get('/microsoft/auth/callback');
    const callbackResponse = await req;
    expect(callbackResponse.status).toBe(302);
    expect(callbackResponse.headers.location).toBe("/");

    //get valid cookie
    var cookies = callbackResponse.headers['set-cookie'].pop().split(';')[0];
    const homeReq = request(app).get("/");
    // Set cookie to get saved user session
    homeReq.cookies = cookies;
    const response = await homeReq;
    expect(response.status).toBe(200);
    expect(response.text).toBe('im the protected');

    //perform logout
    var logoutReq = request(app).get('/baz')
    logoutReq.cookies = cookies;
    var logoutResp = await logoutReq;
    expect(logoutResp.status).toBe(200);
    expect(logoutResp.text.startsWith("You have successfully logged out")).toBe(true);
    expect(logoutResp.text.includes('href="/signin"')).toBe(true);
  })
  // it('custom /signin action route : should work', async () => {
  //     const app = express();
  //     process.env['USER_jane'] = "changeme";
  //     var defaultLoginProvider = new DefaultLoginProvider({
  //       express: app,
  //       signinActionRoute: "/bar"
  //     });
  //     defaultLoginProvider.configure();
  //     server = http.createServer(app);
  //     server.listen(0);
  //
  //     var signinResp = await request(app)
  //       .post('/bar')
  //       .send({ username: 'jane', password: 'changeme' });
  //
  //     expect(signinResp.status).toBe(302);
  //     //get valid cookie
  //     var cookies = signinResp.headers['set-cookie'].pop().split(';')[0];
  //     expect(cookies).not.toBe(null);
  // })
  //
  // it('custom logout route : should work', async () => {
  //     const app = express();
  //     process.env['USER_jane'] = "changeme";
  //     var defaultLoginProvider = new DefaultLoginProvider({
  //       express: app,
  //       logoutRoute : "/foo"
  //     });
  //     defaultLoginProvider.configure();
  //
  //     server = http.createServer(app);
  //     server.listen(0);
  //
  //     //perform logout
  //     var logoutReq = await request(app).get('/foo')
  //     var logoutResp = await logoutReq;
  //     expect(logoutResp.status).toBe(302);
  //     expect(logoutResp.headers.location).toBe("/signin");
  //
  // })
})


//https://gist.github.com/joaoneto/5152248
