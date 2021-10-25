function SessionHelper(){};

SessionHelper.hasValidSession = function(expressInstance) {
  if(typeof expressInstance._router === 'undefined'){
    return false;
  }
  const session = expressInstance._router.stack.find((layer) => layer.name === 'session')
  return typeof session !== 'undefined';
}

module.exports = SessionHelper
