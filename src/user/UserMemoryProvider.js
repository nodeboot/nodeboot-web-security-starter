const EnvironmentHelper = require("../common/EnvironmentHelper.js");

function UserMemoryProvider() {

  this.environmentHelper = new EnvironmentHelper();

  this.usersDefaultLogin;
  this.loadUsersFromMemoryForDefaultLogin = () => {
    var configUsers = {
      "outputType":"object",
      "splitChar":",",
      "indexNames":{
        "0":"password",
        "1":"mail"
      }
    };

    this.usersDefaultLogin = this.environmentHelper.findByPrefix("USER_", configUsers);
  };

  this.usersOauth2Login;
  this.loadUsersAsKeyFromMemoryForOauth2Login = () => {
    var configUsers = {
      "outputType":"array",
      "splitChar":","
    };

    this.usersOauth2Login = this.environmentHelper.findByPrefix("AUTH_", configUsers);
  };

  this.findUserForDefaultLogin = (username) => {
    if(typeof this.usersDefaultLogin === 'undefined'){
      this.loadUsersFromMemoryForDefaultLogin();
    }
    return this.usersDefaultLogin[username];
  };

  this.isUserAllowedForOauth2Login = (email) => {
    if(typeof this.usersOauth2Login === 'undefined'){
      this.loadUsersAsKeyFromMemoryForOauth2Login();
    }

    if(typeof this.usersOauth2Login.allowedUsers === 'undefined'){
      return false;
    }

    return this.usersOauth2Login.allowedUsers.includes(email);
  };
}

module.exports = UserMemoryProvider;
