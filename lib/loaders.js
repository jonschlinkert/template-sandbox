'use strict';

var fs = require('fs');
var path = require('path');

exports.readdir = function (views) {
  return function (start) {
    function lookup(dir) {
      var files = fs.readdirSync(dir);
      var len = files.length;
      while (len--) {
        var name = files[len];
        var fp = path.join(dir, name);

        if (fs.statSync(fp).isDirectory()) {
          lookup(fp);
        } else {
          var file = {ext: path.extname(fp), path: fp};
          if (file.ext === '.html') {
            file.content = fs.readFileSync(fp, 'utf8');
          } else {
            file.content = null;
          }
          views.set(fp, file);
        }
      }
    }
    lookup(start);
    return views;
  };
};
