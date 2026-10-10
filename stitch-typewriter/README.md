# 绣字机 · Stitch Typewriter

一个把文字变成手绣桌布的轻量互动网页。输入一句话，挑一根线，点选图案，像在一块柔软的布上慢慢留下自己的针脚。

这是一个**原创实现**，视觉灵感来自手工刺绣、布料纹理和老式打字机，不使用参考作品的图片或代码。

## 功能

- 10 种绣线颜色，也可以自定义颜色
- 输入中文、英文或 emoji，生成带针脚质感的文字
- 9 种线稿图案：星星、心心、小花、蝴蝶、云朵、月亮、音符、太阳、叶子
- 手绘工具：鼠标、触控板或手机触摸都可以画线
- 剪刀工具：点击或拖过元素即可删除
- 撤销 / 重做、清空布面
- 针脚大小、布面暖度、边框和闪光效果设置
- 一键导出 PNG
- 纯 HTML / CSS / JavaScript，无构建步骤、无第三方运行时依赖

## 本地运行

直接双击 `index.html` 即可打开。若希望使用本地开发服务器：

```bash
python -m http.server 5173
```

然后访问 <http://localhost:5173>。

## 快捷键

- `Enter`：绣上文字
- `Ctrl/Cmd + Z`：撤销
- `Ctrl/Cmd + Shift + Z` 或 `Ctrl/Cmd + Y`：重做

## GitHub Pages

这是静态项目，推送到 GitHub 后，在仓库的 **Settings → Pages** 中选择 `Deploy from a branch`，分支选择 `main`、目录选择 `/ (root)`，保存即可。

## License

MIT
