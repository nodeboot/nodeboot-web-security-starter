const finder = require('find-package-json');
const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const request = require('supertest');
const session = require('express-session');
const DefaultLoginProvider = require('../../../src/login/default/DefaultLoginProvider.js');

describe('DefaultLoginProvider.js', () => {
    let server;

    afterEach(() => {
        if(typeof server !== 'undefined' ){
          server.close();
        }
    })

    it('user not authenticated: should access to /login', async () => {
        const app = express();
        var defaultLoginProvider = new DefaultLoginProvider({
          express: app
        });
        defaultLoginProvider.configure();
        server = http.createServer(app);
        server.listen(0);
        const response = await request(app).get('/signin');
        expect(response.status).toBe(200);
        expect(response.text.includes("Enter Username")).toBe(true);

    })
    it('user not authenticated, good session: should not access to any resource != /login', async () => {
        const app = express();
        var defaultLoginProvider = new DefaultLoginProvider({
          express: app
        });
        defaultLoginProvider.configure();
        server = http.createServer(app);
        app.get('/protected', (req, res) => {
          res.status(200).send('im the protected')
        });
        server.listen(0);
        const response = await request(app).get('/protected');
        expect(response.status).toBe(401);
        expect(response.text.startsWith("You are not allowed to access this page")).toBe(true);

    })
    it('good session, missing env : user cannot signin', async () => {
        const app = express();
        var defaultLoginProvider = new DefaultLoginProvider({
          express: app
        });
        defaultLoginProvider.configure();

        app.get('/protected', (req, res) => {
          return res.status(200).send('im the protected')
        });
        server = http.createServer(app);
        server.listen(0);
        var signinResp = await request(app)
          .post('/signin')
          .send({ username: 'foo', password: 'password' });
        expect(signinResp.status).toBe(302);
        expect(signinResp.headers.location).toBe("/signin");
    })
    it('missing credentials : should see an error message', async () => {
        const app = express();
        process.env['USER_jane'] = "changeme";
        var defaultLoginProvider = new DefaultLoginProvider({
          express: app
        });
        defaultLoginProvider.configure();

        app.get('/protected', (req, res) => {
          return res.status(200).send('im the protected')
        });
        server = http.createServer(app);
        server.listen(0);
        var signinResp = await request(app)
          .post('/signin')
          .send({ foo: 'jane', bar: 'changeme' });

        expect(signinResp.status).toBe(302);
        expect(signinResp.headers.location).toBe("/signin");
        //TODO: validate error message on login
        //get valid cookie
        // var cookies = signinResp.headers['set-cookie'].pop().split(';')[0];
        // const req = await request(app).get(signinResp.headers.location);
        // // Set cookie to get saved user session
        // req.cookies = cookies;
        // const response = await req;
        // console.log(response.text);
        // expect(response.status).toBe(200);
        // expect(response.text.includes("User or password incorrect")).toBe(true);

    })
    it('missing environment users : should see an error message', async () => {
        const app = express();

        var defaultLoginProvider = new DefaultLoginProvider({
          express: app
        });
        defaultLoginProvider.configure();

        server = http.createServer(app);
        server.listen(0);
        var signinResp = await request(app)
          .post('/signin')
          .send({ username: 'noenv', password: 'changeme' });
        expect(signinResp.status).toBe(302);
        expect(signinResp.headers.location).toBe("/signin");
        //TODO: validate error message on login

    })
    it('incorrect password : should see an error message', async () => {
        const app = express();
        process.env['USER_jane'] = "changeme";
        var defaultLoginProvider = new DefaultLoginProvider({
          express: app
        });
        defaultLoginProvider.configure();

        server = http.createServer(app);
        server.listen(0);
        var signinResp = await request(app)
          .post('/signin')
          .send({ username: 'jane', password: 'secret' });

        expect(signinResp.status).toBe(302);
        expect(signinResp.headers.location).toBe("/signin");
        //TODO: validate error message on login
    })
    it('authenticated user, good session, with env : should access to any resource', async () => {
        const app = express();
        process.env['USER_jane'] = "changeme";
        var defaultLoginProvider = new DefaultLoginProvider({
          express: app
        });
        defaultLoginProvider.configure();

        app.get('/protected', (req, res) => {
          return res.status(200).send('im the protected')
        });
        server = http.createServer(app);
        server.listen(0);
        var signinResp = await request(app)
          .post('/signin')
          .send({ username: 'jane', password: 'changeme' });
        //get valid cookie
        var cookies = signinResp.headers['set-cookie'].pop().split(';')[0];

        var req = request(app).get('/protected');
        // Set cookie to get saved user session
        req.cookies = cookies;
        const response = await req;
        expect(response.status).toBe(200);
        expect(response.text).toBe('im the protected');
    })
    it('authenticated user, pre-existent session, with env : should access to any resource', async () => {
        const app = express();
        process.env['USER_jane'] = "changeme";
        var defaultLoginProvider = new DefaultLoginProvider({
          express: app
        });
        app.use(session({
          secret: "secret",
          resave: true,
          saveUninitialized: true,
          cookie: {
            secure: false,
            maxAge: (45 * 60 * 1000)
          }
        }));
        defaultLoginProvider.configure();

        app.get('/protected', (req, res) => {
          return res.status(200).send('im the protected')
        });
        server = http.createServer(app);
        server.listen(0);
        var signinResp = await request(app)
          .post('/signin')
          .send({ username: 'jane', password: 'changeme' });
        //get valid cookie
        var cookies = signinResp.headers['set-cookie'].pop().split(';')[0];

        var req = request(app).get('/protected');
        // Set cookie to get saved user session
        req.cookies = cookies;
        const response = await req;
        expect(response.status).toBe(200);
        expect(response.text).toBe('im the protected');
    })
    it('authenticated user, after logout : should be redirected to /signin', async () => {
        const app = express();
        process.env['USER_jane'] = "changeme";
        var defaultLoginProvider = new DefaultLoginProvider({
          express: app
        });
        defaultLoginProvider.configure();

        app.get('/protected', (req, res) => {
          return res.status(200).send('im the protected')
        });
        server = http.createServer(app);
        server.listen(0);
        var signinResp = await request(app)
          .post('/signin')
          .send({ username: 'jane', password: 'changeme' });
        //get valid cookie
        var cookies = signinResp.headers['set-cookie'].pop().split(';')[0];

        var req = request(app).get('/protected');
        // Set cookie to get saved user session
        req.cookies = cookies;
        const response = await req;
        expect(response.status).toBe(200);
        expect(response.text).toBe('im the protected');

        //perform logout
        var logoutReq = await request(app).get('/logout')
        logoutReq.cookies = cookies;
        var logoutResp = await logoutReq;
        expect(logoutResp.status).toBe(302);
        expect(logoutResp.headers.location).toBe("/signin");

        //TODO: possible issue or incomplete session destroy
        //logout is called but if I use the previous cookies
        //I can enter
        //expected: after logout, old cookies shoul not be valid anymore
        // var newAccessReq = request(app).get('/protected');
        // newAccessReq.cookies = cookies;
        // var newAccessResp = await newAccessReq;
        // console.log(newAccessResp.text);
        // console.log(newAccessResp.headers);
        // console.log(newAccessResp.status);
        // expect(newAccessResp.status).toBe(401);
    })

    it('minimal.html : should exist', async () => {
      var f = finder(__dirname);
      var dir = path.dirname(f.next().filename);
      fs.readFile(path.join(dir, "src", "login", "default", "minimal.html"), "utf8", function(err, html) {
        expect(err).toBe(null);
        expect(html.includes("theme:minimal")).toBe(true);
      })
    })
    it('not provided signinHtmlPath : should load the default signin theme', async () => {
      const app = express();
      var defaultLoginProvider = new DefaultLoginProvider({
        express: app
      });
      defaultLoginProvider.configure();
      server = http.createServer(app);
      server.listen(0);
      var signinResp = await request(app)
        .get('/signin');
      expect(signinResp.status).toBe(200);
      expect(signinResp.text.includes("theme:minimal")).toBe(true);
    })
    it('optiion signinHtmlTheme material : should load the material signin theme', async () => {
      const app = express();
      var defaultLoginProvider = new DefaultLoginProvider({
        express: app,
        signinHtmlTheme: "material"
      });
      defaultLoginProvider.configure();
      server = http.createServer(app);
      server.listen(0);
      var signinResp = await request(app)
        .get('/signin');
      expect(signinResp.status).toBe(200);
      expect(signinResp.text.includes("theme:material")).toBe(true);
    })
    it('provided signinHtmlPath : should load the cutom html', async () => {
      const app = express();
      var defaultLoginProvider = new DefaultLoginProvider({
        express: app,
        signinHtmlPath: path.join(__dirname, "signinHtmlPath.html")
      });
      defaultLoginProvider.configure();
      server = http.createServer(app);
      server.listen(0);
      var signinResp = await request(app)
        .get('/signin');
      expect(signinResp.status).toBe(200);
      expect(signinResp.text.includes("123456")).toBe(true);

      //next request to /signin shoul load the html on memory
      var signinResp2 = await request(app)
        .get('/signin');
      expect(signinResp2.status).toBe(200);
      expect(signinResp2.text.includes("123456")).toBe(true);
    })
    it('custom /signin route : should work', async () => {
      const app = express();
      var defaultLoginProvider = new DefaultLoginProvider({
        express: app,
        signinRoute: "/foo"
      });
      defaultLoginProvider.configure();
      server = http.createServer(app);
      server.listen(0);
      var signinResp = await request(app)
        .get('/foo');
      expect(signinResp.status).toBe(200);
      expect(signinResp.text.includes("theme:minimal")).toBe(true);
    })
    it('custom title for signin form : should work', async () => {
      const app = express();
      var defaultLoginProvider = new DefaultLoginProvider({
        express: app,
        title: "123456789"
      });
      defaultLoginProvider.configure();
      server = http.createServer(app);
      server.listen(0);
      var signinResp = await request(app)
        .get('/signin');
      expect(signinResp.status).toBe(200);
      expect(signinResp.text.includes("123456789")).toBe(true);
    })
    it('custom /signin action route : should work', async () => {
        const app = express();
        process.env['USER_jane'] = "changeme";
        var defaultLoginProvider = new DefaultLoginProvider({
          express: app,
          signinActionRoute: "/bar"
        });
        defaultLoginProvider.configure();
        server = http.createServer(app);
        server.listen(0);

        var signinResp = await request(app)
          .post('/bar')
          .send({ username: 'jane', password: 'changeme' });

        expect(signinResp.status).toBe(302);
        //get valid cookie
        var cookies = signinResp.headers['set-cookie'].pop().split(';')[0];
        expect(cookies).not.toBe(null);
    })

    it('custom logout route : should work', async () => {
        const app = express();
        process.env['USER_jane'] = "changeme";
        var defaultLoginProvider = new DefaultLoginProvider({
          express: app,
          logoutRoute : "/foo"
        });
        defaultLoginProvider.configure();

        server = http.createServer(app);
        server.listen(0);

        //perform logout
        var logoutReq = await request(app).get('/foo')
        var logoutResp = await logoutReq;
        expect(logoutResp.status).toBe(302);
        expect(logoutResp.headers.location).toBe("/signin");

    })
})


//https://gist.github.com/joaoneto/5152248
