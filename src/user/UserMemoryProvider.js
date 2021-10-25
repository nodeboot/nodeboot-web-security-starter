const EnvironmentHelper = require("../common/EnvironmentHelper.js");

function UserMemoryProvider() {

  this.environmentHelper = new EnvironmentHelper();

  this.users;
  this.rolePaths;

  this.loadUsersFromMemory = () => {
    var configUsers = {
      "outputType":"object",
      "splitChar":",",
      "indexNames":{
        "0":"password"
      }
    };

    this.users = this.environmentHelper.findByPrefix("USER_", configUsers);
    console.log("users:");
    for(username in this.users){
      console.log("user: "+username);
    }
  };

  this.findUser = (username) => {
    if(typeof this.users === 'undefined'){
      this.loadUsersFromMemory();
    }
    return this.users[username];
  };
}

module.exports = UserMemoryProvider;
