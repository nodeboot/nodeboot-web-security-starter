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
      "outputType":"object",
      "splitChar":",",
      "indexNames":{
        "0":"mail"
      }
    };

    this.usersOauth2Login = this.environmentHelper.findByPrefix("USER_", configUsers);
  };

  this.findUserForDefaultLogin = (username) => {
    if(typeof this.usersDefaultLogin === 'undefined'){
      this.loadUsersFromMemoryForDefaultLogin();
    }
    return this.usersDefaultLogin[username];
  };

  this.findUserForOauth2Login = (username) => {
    if(typeof this.usersOauth2Login === 'undefined'){
      this.loadUsersAsKeyFromMemoryForOauth2Login();
    }
    return this.usersOauth2Login[username];
  };
}

module.exports = UserMemoryProvider;
