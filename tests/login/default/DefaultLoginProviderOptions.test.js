var finder = require('find-package-json');
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const request = require('supertest');
const session = require('express-session');
const DefaultLoginProvider = require('../../../src/login/default/DefaultLoginProvider.js');

describe('DefaultLoginConfigurer.js', () => {
  let server;

  afterEach(() => {
    if (typeof server !== 'undefined') {
      server.close();
    }
  })

  describe('options', () => {
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
})


//https://gist.github.com/joaoneto/5152248
