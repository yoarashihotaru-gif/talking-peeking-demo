# Talking Peeking HCD Demo v1.0

父亲与女儿双视角的 HCD 浏览器原型，用于课堂展示和用户测试。

## 在线使用

部署到 GitHub Pages 后，直接打开网站首页并选择体验账号。

快速入口：

- 父亲视角：`?view=father`
- 女儿视角：`?view=daughter`

## 本地运行

直接打开 `index.html`，或使用 VS Code Live Server。

## 项目结构

- `index.html`：入口页面
- `css/style.css`：界面样式
- `data/demoData.js`：演示数据
- `js/app.js`：页面逻辑
- `.nojekyll`：让 GitHub Pages 按静态文件直接发布

## Demo 重置

可在 Account 页面点击 `ログアウト`，重置当前账号状态并返回账号选择页。

也可使用：

- `?view=father&reset=1`
- `?view=daughter&reset=1`

## 注意

这是纯前端测试原型。数据和状态保存在访问者自己的浏览器 Local Storage 中。
