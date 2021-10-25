var chai = require('chai');
var path = require('path');
var expect = chai.expect;
var assert = chai.assert;
var should = chai.should;
const UserMemoryProvider = require("../../src/user/UserMemoryProvider.js");

describe('user/UserMemoryProvider.js \tfindUser()', function() {
  it('findUserForDefaultLogin: without env vars', function() {
    // process.env['USER_jane'] = undefined;
    var userMemoryProvider = new UserMemoryProvider();
    var jane = userMemoryProvider.findUserForDefaultLogin("jane");
    expect(undefined).to.equal(jane);
  });
  it('findUserForDefaultLogin: simpe user = pssword', function() {
    process.env['USER_jane'] = "changeme";
    process.env['USER_kurt'] = "secret";
    var userMemoryProvider = new UserMemoryProvider();
    var jane = userMemoryProvider.findUserForDefaultLogin("jane");
    expect("changeme").to.equal(jane.password);
    var kurt = userMemoryProvider.findUserForDefaultLogin("kurt");
    expect("secret").to.equal(kurt.password);
  });
  it('findUserForOauth2Login: simpe user = pssword', function() {
    process.env['USER_jane'] = "jane@mail.com";
    process.env['USER_kurt'] = "kurt@blindspot.com";
    var userMemoryProvider = new UserMemoryProvider();
    var jane = userMemoryProvider.findUserForOauth2Login("jane");
    expect("jane@mail.com").to.equal(jane.mail);
    var kurt = userMemoryProvider.findUserForOauth2Login("kurt");
    expect("kurt@blindspot.com").to.equal(kurt.mail);
  });
});
