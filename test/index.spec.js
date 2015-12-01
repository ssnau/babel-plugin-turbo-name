var turboNamePlugin = require('../');
var babel = require('babel');
var assert = require('assert');
var path = require('path');
var glob = require('glob');

describe('babel auto prefix', function () {
  var templatePath = path.join(__dirname, "_fixtures");
  var a = glob.sync(templatePath + "/**/index.jsx");
  var b = glob.sync(templatePath + "/**/index.js");
  var pages = a.concat(b);
  function transform(filepath) {
    return babel.transformFileSync(filepath, {
      plugins: [turboNamePlugin],
      stage: 0,
    }).code;
  }

  it('should auto assigned turboName', function () {
    pages.forEach(function(pagepath) {
        var compiledCode = transform(pagepath);
        var mo = {exports: {}};
        eval(`
          (function (module) {
            ${compiledCode}
          })(mo)
          `);
        var Clazz = mo.exports;
        assert.ok(pagepath.indexOf(Clazz.turboName) > 0);
    });
  });
});
