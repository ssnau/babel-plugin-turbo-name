import React, {Component} from "react";

export default class extends Component {
  render() {
    return (
      <div>
        <article className="markdown">
          <h1>RoadMap</h1>
          <p>以下是未来开发焦聚的点：</p>
          <ul>
            <li>点赞，用户可以like功能友好的组件，让优秀的组件显示获得优先显示。</li>
            <li>讨论，用户可以在组件页面下评论及提出相应的需求给作者。</li>
            <li>聚合，根据关键字聚合风格一致的组件集，开如ant.design。</li>
            <li>实时体验，用户可以在组件中心写代码实时体验一个组件的使用，无需在本地工作区。</li>
          </ul>
          <br />
          <h1>有问题找谁</h1>
          <p>组件中心还有许多feature尚待完成，如果你觉得有什么需要的改进点，不要犹豫，立刻联系<strong>刘锡金</strong><code>liuxijin@meituan.com</code>吧</p>
        </article>
      </div>
    )
  }
}
