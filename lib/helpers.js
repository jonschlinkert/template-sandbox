


// var helpers = module.exports = require('handlebars-helpers')();

var helpers = module.exports;

helpers.is = function (a, b, options) {
  if (arguments.length !== 3) {
    console.log('`is` helper is missing an argument. start by looking in: ' + this.context.view.path);
  }
  if (a === b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
};

helpers.assets = function () {
  var view = this.context.view;
  var dest = view.data.dest || view.path;
  return relativePath(dest, this.context.assets || '');
};

helpers.linkTo = function (key, collection, options) {
  if (typeof collection === 'object') {
    options = collection;
    collection = null;
  }
  collection = collection || 'pages';
  if (typeof this.app[collection] === 'undefined') {
    var msg = 'Invalid collection `' + collection + '`';
    console.error(red(msg));
    throw new Error(msg);
  }
  var fromView = this.context.view;
  var toView = this.app[collection].get(key);
  if (!toView) {
    var msg = 'Unable to find ' + key + ' in ' + collection;
    console.error(red(msg));
    throw new Error(msg);
  }
  var fromDest = fromView.data.dest;
  var toDest = toView.data.dest;
  return relativePath(fromDest, toDest);
};
