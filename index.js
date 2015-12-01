var fs = require('fs');
var path = require('path');

function getNodeProjectRoot(cwd) {
    var count = 0;
    var found = false;
    // 最多查找18层
    while (count++ < 18 && cwd) {
        if (fs.existsSync(path.join(cwd, 'package.json'))) {
            found = true;
            break;
        }
        cwd = path.join(cwd, '..');
    }
    if (found) return cwd;
    else throw new Error('没有在当前目录及上层目录找到package.json文件');
}

var getRoot = function () {
  var cache = {};
  return function (filepath) {
    try {
      cache[filepath] = getNodeProjectRoot(filepath);
      return cache[filepath];
    } catch (e) {
      return null;
    }
  }
}();

module.exports = function turboAutoName(babel) {
  var Plugin = babel.Plugin;
  var t = babel.types;
  var block = t.blockStatement.bind(t);
  var me = t.MemberExpression.bind(t);
  var id = t.identifier.bind(t);
  function makeAssign(expression, name) {
    return  (
      t.tryStatement(
          t.blockStatement([
            t.AssignmentExpression( '=',    expression, t.literal(name))
          ]),
          t.catchClause(
            t.identifier('e'),
            t.blockStatement([])
          )
        )
      );
  }
  return new Plugin('turbo-name', {
    visitor: {
      Program: {
        exit: function (node, parent, scope, file) {
          var filepath = file.opts.filename;
          // AVOID MAGIC PATH: client/page
          // fast check!
          if (!(/client\/page\/.*index\.jsx?$/).test(filepath)) return;
          var rootpath = getRoot(path.dirname(filepath));
          if (!rootpath) {
            throw new Error(`文件[${filepath}]往上查找不到package.json，您的项目可能没有根目录.`);
          }
          // check again!!
          if (filepath.indexOf(path.join(rootpath, 'client/page')) !== 0) return;
          var relname = path.relative(getRoot(filepath), filepath).replace(/\/index\.jsx?$/, '');

          node.body.push(
            makeAssign(me(
                         me(id('exports'), id('default')),
                         id('turboName')
                       ), relname),
           makeAssign(me(
                        me(id('module'), id('exports')),
                        id('turboName')
                      ), relname),
           makeAssign(me(me(me(id('module'), id('exports')), id('default')),
                        id('turboName')
                      ), relname)
          );
        }
      }
    }
  });
}
