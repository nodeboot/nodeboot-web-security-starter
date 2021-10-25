var passport = require('passport')
	, util = require('util');

function ErrorNotAuthenticatedMockStrategy(options, verify) {
	this.name = 'microsoft';
	this.passAuthentication = options.passAuthentication || true;
	this.userId = options.userId || 1;
	this.verify = verify;
	this.mockUser = options.mockUser;
}

util.inherits(ErrorNotAuthenticatedMockStrategy, passport.Strategy);

ErrorNotAuthenticatedMockStrategy.prototype.authenticate = function authenticate(req) {
	if (this.passAuthentication) {
		var user = {
		};
		var self = this;
		req.isAuthenticated = function(){
			return false;
		}
		self.success({});
	} else {
		this.fail('Unauthorized');
	}
}

module.exports = ErrorNotAuthenticatedMockStrategy;
