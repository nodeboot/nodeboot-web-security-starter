var passport = require('passport')
	, util = require('util');

function ErrorNotValidMailMockStrategy(options, verify) {
	this.name = 'microsoft';
	this.passAuthentication = options.passAuthentication || true;
	this.userId = options.userId || 1;
	this.verify = verify;
	this.mockUser = options.mockUser;
}

util.inherits(ErrorNotValidMailMockStrategy, passport.Strategy);

ErrorNotValidMailMockStrategy.prototype.authenticate = function authenticate(req) {
	if (this.passAuthentication) {
		var user = {
		};
		var self = this;
		self.success({});
	} else {
		this.fail('Unauthorized');
	}
}

module.exports = ErrorNotValidMailMockStrategy;
