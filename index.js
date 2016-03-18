var fs = require('fs');
var path = require('path');

function getNodeProjectRoot (cwd) {
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
  if (found) {
    return cwd;
  } else {
    throw new Error('没有在当前目录及上层目录找到package.json文件');
  }
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

module.exports = function turboAutoName (babel) {
  var t = babel.types;
  var block = t.blockStatement.bind(t);
  var me = t.MemberExpression.bind(t);
  var id = t.identifier.bind(t);

  var TURBO_NAME = 'turboName';
  var CLASSES = '_turboClasses';

  function makeAssign (expression, name) {
    var window_turboClasses = t.MemberExpression(t.identifier('window'), t.identifier(CLASSES));
    return [
      t.toStatement(t.AssignmentExpression(
        '=',
        t.MemberExpression(expression, t.identifier(TURBO_NAME)),
        t.stringLiteral(name)
      )),
      t.ifStatement(
        t.BinaryExpression(
          '!==',
          t.UnaryExpression('typeof', t.identifier('window')),
          t.stringLiteral('undefined')
        ),
        t.BlockStatement([
          t.toStatement(t.AssignmentExpression(
            '=',
            window_turboClasses,
            t.LogicalExpression('||', window_turboClasses, t.ObjectExpression([]))
          )),
          t.toStatement(t.AssignmentExpression(
            '=',
            t.MemberExpression(window_turboClasses, t.stringLiteral(name), true),
            expression
          ))
        ])
      )
    ]
  }

  function makeTurbo (expression, name) {
    return (
      t.ifStatement(
        t.BinaryExpression(
          '===',
          t.UnaryExpression('typeof', expression),
          t.stringLiteral('function')
        ),
        t.BlockStatement(
          makeAssign(expression, name)
        )
      )
    );
  }

  return {
    visitor: {
      Program: {
        exit: function (_path) {
          var node = _path.node;
          var file = _path.hub.file;

          var filepath = file.opts.filename;
          // AVOID MAGIC PATH: client/page
          // fast check!
          if (!(/client\/page\/.*index\.jsx?$/).test(filepath)) {
            return;
          }
          var rootpath = getRoot(path.dirname(filepath));
          if (!rootpath) {
            throw new Error(`文件[${filepath}]往上查找不到package.json，您的项目可能没有根目录.`);
          }
          // check again!!
          if (filepath.indexOf(path.join(rootpath, 'client/page')) !== 0) {
            return;
          }
          var relname = path.relative(getRoot(filepath), filepath).replace(/\/index\.jsx?$/, '');

          var module_exports = t.MemberExpression(id('module'), t.stringLiteral('exports'), true);
          var exports_default = t.MemberExpression(id('exports'), t.stringLiteral('default'), true);
          var count = 0;
          node.body.push(makeTurbo(module_exports, relname + count));
          node.body.push(makeTurbo(exports_default, relname + (count + 1)));
        }
      }
    }
  };
}
