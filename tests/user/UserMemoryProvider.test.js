var chai = require('chai');
var path = require('path');
var expect = chai.expect;
var assert = chai.assert;
var should = chai.should;
const UserMemoryProvider = require("../../src/user/UserMemoryProvider.js");

describe('user/UserMemoryProvider.js \tfindUser()', function() {
  it('without env vars', function() {
    // process.env['USER_jane'] = undefined;
    var userMemoryProvider = new UserMemoryProvider();
    var jane = userMemoryProvider.findUser("jane");
    expect(undefined).to.equal(jane);
  });
  it('simpe user = pssword', function() {
    process.env['USER_jane'] = "changeme";
    process.env['USER_kurt'] = "secret";
    var userMemoryProvider = new UserMemoryProvider();
    var jane = userMemoryProvider.findUser("jane");
    expect("changeme").to.equal(jane.password);
    var kurt = userMemoryProvider.findUser("kurt");
    expect("secret").to.equal(kurt.password);
  });
});
