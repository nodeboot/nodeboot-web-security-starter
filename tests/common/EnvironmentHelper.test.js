var chai = require('chai');
var path = require('path');
var expect = chai.expect;
var assert = chai.assert;
const EnvironmentHelper = require("../../src/common/EnvironmentHelper.js");
var environmentHelper = new EnvironmentHelper();

describe('common/EnvironmentHelper.js \tfindByPrefix()', function() {
  it('read vars without config', function() {
    process.env['USER_jane'] = "pass1 , all";
    process.env['USER_kurt'] = "pass2 , role1";
    var data = environmentHelper.findByPrefix("USER_");
    assert(data);
    // expected
    // {
    //     "jane": "pass1 , all",
    //     "kurt": "pass2 , role1"
    // }
    expect(data.jane).to.equal("pass1 , all");
    expect(data['kurt']).to.equal("pass2 , role1");
  });
  it('read vars with wrong config', function() {
    process.env['USER_jane'] = "pass1 , all";
    process.env['USER_kurt'] = "pass2 , role1";
    try{
      environmentHelper.findByPrefix("USER_", {"foo":"bar"});
    }catch(err){
      assert(err);
      expect(err.message).to.equal("outputType is required if config is used");
    }
  });
  it('unsupported type', function() {
    process.env['USER_jane'] = "pass1 , all";
    process.env['USER_kurt'] = "pass2 , role1";
    var config = {
      "outputType":"foo",
      "splitChar":",",
      "indexNames":{
        "0":"password",
        "1":"role"
      }
    };

    expect( function () {
        var data = environmentHelper.findByPrefix("USER_", config);
    }, "Exception not thrown when outputType is not supported" ).to.throw( Error );
  });

  it('undefined splitChar', function() {
    process.env['USER_jane'] = "pass1 , all";
    process.env['USER_kurt'] = "pass2 , role1";
    var config = {
      "outputType":"object",
      "indexNames":{
        "0":"password",
        "1":"role"
      }
    };

    expect( function () {
        var data = environmentHelper.findByPrefix("USER_", config);
    }, "Exception not thrown when splitChar is not sent" ).to.throw( Error );
  });
  it('read vars as object', function() {
    process.env['USER_jane'] = "pass1 , all";
    process.env['USER_kurt'] = "pass2 , role1";
    var config = {
      "outputType":"object",
      "splitChar":",",
      "indexNames":{
        "0":"password",
        "1":"role"
      }
    };
    var data = environmentHelper.findByPrefix("USER_", config);
    assert(data);
    // expected:
    // {
    //     "jane": {
    //         "password": "pass1",
    //         "role": "all"
    //     },
    //     "kurt": {
    //         "password": "pass2",
    //         "role": "role1"
    //     }
    // }
    expect(data.jane.password).to.equal("pass1");
    expect(data.jane.role).to.equal("all");
    expect(data.kurt.password).to.equal("pass2");
    expect(data.kurt.role).to.equal("role1");
  });

  it('undefined indexNames when object is required', function() {
    process.env['USER_jane'] = "pass1 , all";
    process.env['USER_kurt'] = "pass2 , role1";
    var config = {
      "outputType":"object",
      "splitChar":","
    };

    expect( function () {
        var data = environmentHelper.findByPrefix("USER_", config);
    }, "Exception not thrown when indexNames is not sent and object is required" ).to.throw( Error );
  });

  it('read vars as array', function() {
    process.env['ROLE_all'] = "item1, item2, item3";
    process.env['ROLE_dev'] = "item4   , item5";
    var config = {
      "outputType":"array",
      "splitChar":","
    };
    var data = environmentHelper.findByPrefix("ROLE_", config);
    assert(data);
    // expected:
    // {
    //     "all": [
    //         "item1",
    //         "item2",
    //         "item3"
    //     ],
    //     "dev": [
    //         "item4",
    //         "item5"
    //     ]
    // }
    expect(data.all.length).to.equal(3);
    expect(data.dev.length).to.equal(2);
    expect(data.dev[0]).to.equal("item4");
    expect(data.dev[1]).to.equal("item5");
  });
});
