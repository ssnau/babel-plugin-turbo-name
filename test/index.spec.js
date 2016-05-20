var turboNamePlugin = require('../');
var babel = require('babel-core');
var assert = require('assert');
var path = require('path');
var glob = require('glob');

describe('babel auto prefix', function () {
  var templatePath = path.join(__dirname, "_fixtures");
  var a = glob.sync(templatePath + "/**/index.jsx");
  var b = glob.sync(templatePath + "/**/index.js");
  var pages = a.concat(b);

  function transform (filepath) {
    return babel.transformFileSync(filepath, {
      plugins: [turboNamePlugin, 'transform-es2015-modules-commonjs'],
      presets: ['react']
    }).code;
  }

  it('should auto assigned turboName', function () {
    pages.forEach(function (pagepath) {
      var compiledCode = transform(pagepath);
      var ex = {};
      var mo = {exports: ex};
      eval(`
          (function (module, exports) {
            ${compiledCode}
          })(mo, ex)
          `);
      var Clazz = typeof mo.exports === 'function' ? mo.exports : mo.exports['default'];
      assert.ok(pagepath.indexOf(Clazz.turboName.slice(0, 10)) > 0);
    });
  });

  it('should read package.json config', function () {
    // please check package.json for turbo-plugin-path-pattern field
    var templatePath = path.join(__dirname, "_fixtures2");
    var pages = [
      {
        path: path.join(templatePath, 'src/index/index.jsx'),
        pass: true,
      },
      {
        path: path.join(templatePath, 'src/index/abc.js'),
        pass: false
      },
      {
        path: path.join(templatePath, 'index.jsx'),
        pass: false
      }
    ];
    pages.forEach(function (cfg) {
      var compiledCode = transform(cfg.path);
      var ex = {};
      var mo = {exports: ex};
      eval(`
          (function (module, exports) {
            ${compiledCode}
          })(mo, ex)
          `);
      var Clazz = typeof mo.exports === 'function' ? mo.exports : mo.exports['default'];
      if (cfg.pass) {
        assert.ok(cfg.path.indexOf(Clazz.turboName.replace(/\d+$/, '')) > 0);
      } else {
        assert.equal(Clazz.turboName, void 0);
      }
    });
  });
});
