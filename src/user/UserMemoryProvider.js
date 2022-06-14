const EnvironmentHelper = require("../common/EnvironmentHelper.js");

function UserMemoryProvider(userDatasourceOptions) {

  this.options = userDatasourceOptions;
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

    this.usersDefaultLogin = this.environmentHelper.findByPrefix(this.options.envKey, configUsers);
  };

  this.oauth2AllowedUsers;
  this.loadUsersFromMemoryForOauth2Login = () => {
    console.log(process.env["test_id"]);
    try{
      this.oauth2AllowedUsers = process.env[this.options.envKey].replace(/ /g,'').split(",");
    }catch(err){
      console.log("Error while user are extracting from environment variable:"+this.options.envKey);
      console.log(err);
      this.oauth2AllowedUsers = [];
    }
  };

  this.findUserForDefaultLogin = (username) => {
    if(typeof this.usersDefaultLogin === 'undefined'){
      this.loadUsersFromMemoryForDefaultLogin();
    }
    return this.usersDefaultLogin[username];
  };

  this.isUserAllowedForOauth2Login = (email) => {
    if(typeof this.oauth2AllowedUsers === 'undefined'){
      this.loadUsersFromMemoryForOauth2Login();
    }

    return this.oauth2AllowedUsers.includes(email);
  };
}

module.exports = UserMemoryProvider;
