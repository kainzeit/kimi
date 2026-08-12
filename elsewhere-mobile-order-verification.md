# Elsewhere 移动端排序验证

移动端 Elsewhere 已使用反向列流：外层网格使用 `column-reverse`，每一行的 entry 也使用 `column-reverse`，因此视觉顺序从顶部到下方为最新日期到最早日期。

375px 浏览器验证结果：`gridDirection=column-reverse`、`rowFlexDirection=column-reverse`、`rowDirection=ltr`，日期顺序为 `August 12, 2026`、`August 5, 2026`，页面 `scrollWidth` 等于视口宽度，无横向溢出。桌面端仍保持 `column-reverse` + `rtl` 的 Z 字形布局、3cm 水平间距和 7cm 缩略图。

视觉截图确认：最新照片显示在移动端最上方，最早照片显示在下方，日期和正文预览跟随各自照片排列。
