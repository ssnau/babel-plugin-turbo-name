import React, {Component} from "react";

module.exports = React.createClass({
  render() {
    return (
      <div>
        <article className="markdown">
          <h1>如何从组件中心删除一个组件?</h1>
          <dl>
          <dt>假设你的组件名为<code>@mtfe/something-i-dont-want</code>, 你觉得这个名字不好听，却已经被组件中心收录了。现在想要将它从组件中心去除，该如何操作呢？</dt>
          <br />
          <dd>在你的组件的<code>package.json</code>的<code>keywords</code>里加上<code>'deprecated'</code>，然后将小版本升级一下，发布到npm上，这样组件中心在更新你的组件时，发现了<code>deprecated</code>关键字，就将其去除了。</dd>
          </dl>
        </article>

      </div>
    )
  }
})
