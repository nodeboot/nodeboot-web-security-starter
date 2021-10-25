function EnvironmentHelper() {

  this.findByPrefix = function(prefix, valueExtractorIndexConfig) {
    var environments = process.env;
    var data = {};
    var isOutputTypeSimple = false;
    var allowedTypes = ["array","object"];

    if(typeof valueExtractorIndexConfig === 'undefined'){
       isOutputTypeSimple = true;
    }else{
      isOutputTypeSimple = false;
      if(typeof valueExtractorIndexConfig.outputType === 'undefined'){
        throw new Error("outputType is required if config is used");
      }

      if(!allowedTypes.includes(valueExtractorIndexConfig.outputType)){
        throw new Error(`outputType: ${valueExtractorIndexConfig.outputType} is not supported. Just ${allowedTypes} are allowed`);
      }

      if(typeof valueExtractorIndexConfig.splitChar === 'undefined'){
        throw new Error("splitChar is required if outputType is used in config");
      }

      if(valueExtractorIndexConfig.outputType === 'object'){
        if(typeof valueExtractorIndexConfig.indexNames === 'undefined'){
          throw new Error("indexNames is required if outputType is object");
        }
      }
    }


    for(key in environments){
      if(!key.startsWith(prefix)){
        continue;
      }
      var parsedKey = key.replace(prefix,"");
      var rawValue = environments[key];
      //don't have config or is wrong
      if(isOutputTypeSimple===true){
        data[parsedKey] = rawValue.trim();
        continue;
      }

      //output must be an array or object

      //value contains more data which needs to be parsed
      var rawValueEntries = rawValue.split(valueExtractorIndexConfig.splitChar);
      //is an array
      if(valueExtractorIndexConfig.outputType === 'array'){
        let array = rawValueEntries.map(s => s.trim());
        data[parsedKey] = array;
        continue;
      }

      //is an object
      for(var i=0; i<rawValueEntries.length; i++){
        let name = valueExtractorIndexConfig.indexNames[i]
        let value = rawValueEntries[i].trim();
        if(typeof data[parsedKey] === 'undefined'){
          data[parsedKey] = {};
        }
        data[parsedKey][name] = value;
      }
    }
    return data;
  }
}

module.exports = EnvironmentHelper;
