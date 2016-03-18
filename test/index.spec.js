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

  it('should auto assigned turboName', function (done) {
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
    done();
  });
});
