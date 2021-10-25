var passport = require('passport'),
  util = require('util');

function SuccessMockStrategy(options, verify) {
  this.name = 'microsoft';
  this.passAuthentication = options.passAuthentication || true;
  this.userId = options.userId || 1;
  this.verify = verify;
}

util.inherits(SuccessMockStrategy, passport.Strategy);

SuccessMockStrategy.prototype.authenticate = function authenticate(req) {
  if (this.passAuthentication) {
    var user = {
        emails: [{
          value: "jane@microsoft.com"
        }]
      },
      self = this;

    function verified(err, user, info) {
      if (err) {
        return self.error(err);
      }
      if (!user) {
        return self.fail(info);
      }
      self.success(user, info);
    }

    this.verify("accessTokenMock", "refreshTokenMock", user, verified)
  } else {
    this.fail('Unauthorized');
  }
}

module.exports = SuccessMockStrategy;
