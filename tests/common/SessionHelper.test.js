const SessionHelper = require('../../src/common/SessionHelper.js');
const http = require('http');
const express = require('express');
const request = require('supertest');
const session = require('express-session');

describe('util.js', () => {
    let server;

    afterEach(() => {
        if(typeof server !== 'undefined'){
          server.close();
        }
    })

    describe('hasValidSession', () => {
        it('should be instantiable', async () => {
            var inst = new SessionHelper();
            expect(inst).not.toBe(null);
        })
        it('should return false if session is not configured', async () => {
            const app = express();
            app.get('/health', (req, res) => {
                res.status(200).send('success')
            });
            server = http.createServer(app);
            server.listen(0);
            const response = await request(app).get('/health');
            expect(response.status).toBe(200);
            let isValid = SessionHelper.hasValidSession(app);
            expect(isValid).toBe(false);
        })
        it('should return true if exist at least a minimal configured session', async () => {
            const app = express();
            app.use(session({
              secret: "changeme",
              resave: true,
              saveUninitialized: true,
              cookie: {
                secure: false,
                maxAge: (45 * 60 * 1000)
              }
            }));
            app.get('/health', (req, res) => {
                res.status(200).send('success')
            });
            server = http.createServer(app);
            server.listen(0);
            const response = await request(app).get('/health');
            expect(response.status).toBe(200);
            let isValid = SessionHelper.hasValidSession(app);
            expect(isValid).toBe(true);
        })
    })
})
