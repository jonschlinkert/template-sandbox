'use strict';

// var helpers = require('./lib/helpers');
var loaders = require('./lib/loaders');

var path = require('path');
var async = require('async');
var write = require('write');
var relativePath = require('relative-dest');
var convert = require('liquid-to-handlebars');
var matter = require('parser-front-matter');
var copy = require('cp-file');
var red = require('ansi-red');
var App = require('template');
var app = new App();

app.data({assets: '_gh_pages/assets'})

/**
 * Middleware
 */

app.onLoad(/\.(hbs|md)$/, function (view, next) {
  matter.parse(view, next);
});

// app.preRender(/\.(hbs|md)$/, function (view, next) {
//   var parsed = view.parsePath();
//   var destpath = view.permalink('_gh_pages/:base/:name.html', parsed);
//   view.data.dest = destpath;
//   next();
// });

/**
 * Engine
 */

app.engine(['html', 'hbs', 'md'], require('engine-handlebars'));

/**
 * Register helpers
 */

app.helper('is', function (a, b, options) {
  if (arguments.length !== 3) {
    console.log('`is` helper is missing an argument. start by looking in: ' + this.context.view.path);
  }
  if (a === b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});
app.helper('date_to_string', function () {
  return ''
});

app.helper('assets', function () {
  var view = this.context.view;
  var dest = view.data.dest || view.path;
  return relativePath(dest, this.context.assets || '');
});

app.helper('relative', function (key) {
  var destView = this.app.posts.get(key);
  var view = this.context.view;
  // console.log(view.data.dest, ' ==> ', destView.data.dest);
  var dest = view.data.dest || view.path;
  return relativePath(dest, destView.data.dest || destView.data.path);
});

app.helper('markdown', require('helper-markdown'));

// var collections = Object.keys(helpers.helpers);

// collections.forEach(function (key) {
//   var collection = helpers.helpers[key];
//   app.visit('helpers', collection);
// });

/**
 * Config
 */

var config = {
  src: {
    path: 'vendor/bootstrap/docs',
    ext: '.html'
  },
  dest: {
    path: 'src/_docs',
    ext: '.hbs',
  }
};
function rename(fp) {
  return fp;
}
app.option('renameKey', rename);

/**
 * Custom `readdir` loader, for loading bootstrap's src files.
 */

app.loader('readdir', {loaderType: 'sync'}, loaders.readdir);

/**
 * Create a custom view collection. We also pass the
 * custom loader we just created, `readdir`, ensuring that
 * all `posts` will be loaded using our custom loader.
 */

app.create('files', ['readdir']);
app.create('includes', {viewType: 'partial'});
app.create('layouts', {viewType: 'layout'});
app.create('posts');

function renameKey(fp) {
  return path.basename(fp, path.extname(fp));
}

app.posts.option('renameKey', renameKey);
app.includes.option('renameKey', renameKey);
app.layouts.option('renameKey', renameKey);

/**
 * Copy source files and convert liquid to handlebars...
 */

// app.files(config.src.path)
//   .forOwn(function (file, key) {
//     var base = file.path.slice(config.src.path.length + 1);
//     var destpath = path.join(config.dest.path, base);

//     if (file.ext === config.src.ext) {
//       var re = new RegExp('\\' + config.src.ext + '$')
//       destpath = destpath.replace(re, config.dest.ext);
//       // console.log('converting liquid...', destpath);
//       write.sync(destpath, convert(file.content));
//     } else if (!/jade|plugins/.test(file.path)) {
//       try {
//         copy.sync(file.path, destpath);
//         // console.log('copied...', destpath);
//       } catch(err) {
//         console.error(err);
//       }
//     }
//   });


var config = {
  src: {
    path: 'vendor/bootstrap-blog/_posts',
    ext: '.md'
  },
  dest: {
    path: 'src/_blog/_posts',
    ext: '.md',
  }
};

// app.files(config.src.path)
//   .forOwn(function (file, key) {
//     var base = file.path.slice(config.src.path.length + 1);
//     var destpath = path.join(config.dest.path, base);

//     if (file.ext === config.src.ext) {
//       var re = new RegExp('\\' + config.src.ext + '$')
//       destpath = destpath.replace(re, config.dest.ext);
//       console.log('converting liquid...', destpath);
//       console.log(file.path)
//       write.sync(destpath, convert(file.content));
//     } else if (!/jade|plugins/.test(file.path)) {
//       try {
//         copy.sync(file.path, destpath);
//         // console.log('copied...', destpath);
//       } catch(err) {
//         console.error(err);
//       }
//     }
//   });


/**
 * Load includes and layouts...
 */

app.layouts('src/_docs/_layouts/*.hbs');
app.includes('src/_docs/_includes/**/*.hbs');


var posts = app.posts('src/_docs/*.hbs');
posts.forOwn(function (view) {
  // view.ctx('locals', {base: '.'});
  var parsed = view.parsePath();
  parsed.base = '.';
  var destpath = view.permalink('_gh_pages/:base/:name.html', parsed);
  view.data.dest = destpath;
});

var keys = Object.keys(posts);

async.eachSeries(keys, function (key, cb) {
  var view = posts[key];
  app.render(view, {base: '.'}, function (err, res) {
    if (err) return console.error(red(err));
    // var parsed = res.parsePath();
    // var destpath = res.permalink('_gh_pages/:name.html', parsed);
    // write.sync(destpath, res.content);
    write.sync(res.data.dest, res.content);
    cb();
  });
}, function (err) {
  if (err) return console.error(red(err));
  console.log('finished site...');
})

/**
 * Load includes and layouts...
 */

// app.layouts('src/blog/_layouts/*.hbs');
// app.includes('src/blog/_includes/**/*.hbs');
// var posts = app.posts('src/blog/_posts/*.md');

// async.eachSeries(Object.keys(posts), function (key, cb) {
//   var view = posts[key];
//   app.render(view, {base: 'blog'}, function (err, res) {
//     if (err) return console.error(red(err));
//     // var parsed = res.parsePath();
//     // var destpath = res.permalink('_gh_pages/blog/:name.html', parsed);
//     write.sync(res.data.dest, res.content);
//     cb();
//   });
// }, function (err) {
//   if (err) return console.error(red(err));
//   console.log('finished blog...');
// });
