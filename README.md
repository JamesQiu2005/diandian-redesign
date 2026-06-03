# 点点 AI ≠ 一个 chatbot 频道

> 小红书 PC 端点点 AI 能力重设计 · 作品集 Demo
> **核心主张：UGC 是主体，AI 是组织者。**

一个纯静态的单页叙事，配套《点点桌面端产品重定义 PRD》，把"点点不该是一个频道、而该是一种融进搜索的能力"这件事讲清楚。看的人在 2–3 分钟内能理解产品逻辑。

---

## 设计意图

| 决策 | 理由 |
|---|---|
| **搜索框沉到底部 · 液态玻璃** | 这是全案的视觉论点。瀑布流在半透明玻璃下继续流动、被柔化（`backdrop-filter`），呼应 Apple Liquid Glass —— 需要时拉起，不需要时安静待着，不再压制内容消费。 |
| **对话流内联笔记卡片** | Section 05 是核心论证。AI 回答精简，UGC 卡片直接铺在对话流里（不折叠、不跳转），这是 Perplexity / ChatGPT 都做不到的形态。 |
| **绿色 glow = 可恢复的 AI session** | 复用小红书已有的搜索历史，不另建对话管理系统。 |
| **编辑式 case-study 质感** | 暖纸张底色 + 思源宋体大标题 + 小红书红只作强调色，刻意避开"AI slop"美学（紫色渐变、过度圆角、generic emoji）。 |
| **基于现状改造** | 四张参考截图（主页 / 点点对话 / 搜索框 / 笔记详情）的真实结构被重绘为 mockup，"诊断"与"重构"一一对应。 |

四张参考截图对应的改造：

- `main_page_reference` → Section 02 现状 mockup（顶部搜索压制瀑布流）+ Section 03 重构
- `Search_bar_reference` → 入口二的历史记录 glow
- `DianDian_Chat_reference` → Section 05 对话流（把折叠的参考笔记搬进主体）
- `UGC_After_clicking…_reference` → 入口三 详情页"问点点"按钮

---

## 文件结构

```
diandian-redesign/
├── index.html      # 单页叙事结构（7 个 section）
├── styles.css      # 全部样式（含液态玻璃、瀑布流、对话流、飞轮）
├── script.js       # 滚动进度 / 入场动画 / 瀑布流渲染 / 玻璃搜索框 / 对话演示
├── mock_data.js    # 全部 hard-coded 数据（笔记卡片 + 对话脚本 + 历史）
├── pyproject.toml  # UV 项目声明（无运行时依赖，仅用于起本地预览）
└── README.md
```

技术栈：纯 HTML + CSS + Vanilla JS，无框架、无构建步骤。封面图用 `picsum.photos`（按笔记 id 取种子，保证稳定），离线时自动降级为 CSS 渐变兜底，不影响版式。

---

## 本地预览（UV）

无需安装任何依赖，直接用 UV 起一个静态服务器：

```bash
cd diandian-redesign
uv run python -m http.server 8000
```

然后打开 <http://localhost:8000>。

> 直接双击 `index.html` 也能看，但走 `http://` 协议能保证字体与图片正常加载。

---

## 部署

### GitHub Pages
1. 把 `diandian-redesign/` 内容推到仓库（可放根目录或 `/docs`）。
2. Settings → Pages → Source 选对应分支与目录，保存。
3. 访问 `https://<用户名>.github.io/<仓库名>/`。

### Vercel
1. `npm i -g vercel`（或用网页端 Import）。
2. 在 `diandian-redesign/` 下执行 `vercel`，框架选 **Other**，无需 build 命令、输出目录即当前目录。
3. 跟随提示完成，拿到线上链接。

> 静态站点，二选一即可；Vercel 给的预览链接更适合放进简历/投递。

---

## 待替换

- `index.html` 中 Section 07 的 GitHub / Reggia / PRD 链接（标了 `data-replace` 的占位项）替换为你的真实链接。
- 邮箱已填 `hq2144@nyu.edu`。

---

*所有数据均为虚构，仅用于演示交互形态。*
