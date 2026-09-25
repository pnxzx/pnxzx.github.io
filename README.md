# pnxzx.github.io

## 🌟 项目简介

这是一个使用现代前端技术栈开发的非官方学校网站，旨在学习前端知识

## 🚀 技术栈

- **框架**: [Vue3](https://cn.vuejs.org/)
- **包管理器**: Yarn 4
- **构建工具**: Vite
- **路由**: Vue Router
- **内容处理**: marked + 自研 frontmatter 解析 + DOMPurify（Markdown 新闻）

## 推荐的 IDE 设置

推荐使用 [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（并禁用 Vetur）。

## 📁 项目结构

```
pnxzx.github.io/
├── public/                 # 静态资源（含导入文章的图片 public/assets/news/）
├── scripts/                # 工具脚本（公众号导入等）
├── src/
│   ├── assets/            # 资源文件
│   ├── components/        # 公共组件（含新闻列表/详情）
│   ├── content/news/      # 新闻 Markdown 源文件（按 年/月 组织）
│   ├── pages/             # 页面组件
│   ├── routers/           # 路由配置
│   ├── utils/             # Markdown 解析与新闻加载
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── index.html             # SPA 入口
├── package.json           # 项目配置
├── vite.config.js         # Vite 配置
├── jsconfig.json          # 路径别名配置
└── yarn.lock              # Yarn 锁文件
```

## 🛠️ 开发环境设置

### 前置要求

- [Node.js](https://nodejs.org/) (版本 20.19 或更高，见 `package.json` 的 `engines`)
- Yarn (版本 4.9.1，通过 corepack 启用)

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/pnxzx/pnxzx.github.io.git

# 进入项目目录
cd pnxzx.github.io

# 安装依赖
yarn install
```

### 编译和热重载以用于开发

```bash
yarn dev
```

项目将在 `http://localhost:5173` 运行（默认端口）。


## 📝 功能特性

### 已实现功能
- [X] 页面
- [X] Markdown 驱动的新闻系统（分类/搜索/图片与视频嵌入）
- [X] 公众号文章一键导入脚本

### 计划功能
- [ ] 更多页面

## 📰 新闻内容管理

新闻以 Markdown 文件形式存放在 `src/content/news/<年>/<月>/` 下，构建时自动打包，无需后端。

### 手动撰写

新建 `.md` 文件（如 `src/content/news/2026/09/开学通知.md`）：

```markdown
---
title: "文章标题"
date: "2026-09-01"
author: "校办公室"
category: "通知公告"
tags: ["标签1", "标签2"]
featured: false
summary: "显示在列表页的摘要"
---

正文支持标准 Markdown，图片和视频语法：

![图片说明](https://example.com/photo.jpg "图注")

@[video](https://www.bilibili.com/video/BVxxxx)   <!-- 自动嵌入播放器 -->
```

### 从公众号导入

一键抓取公众号文章并转为站内新闻：

```bash
yarn node scripts/import-wechat.mjs "https://mp.weixin.qq.com/s/xxxx"
```

**可用选项**：

| 选项 | 说明 |
|---|---|
| `--category X` | 设置分类（默认 `转载`） |
| `--tags a,b` | 逗号分隔的标签（默认 `公众号`） |
| `--dry-run` | 仅预览解析结果，不写入文件 |
| `--no-images` | 不下载图片，保留微信外链（不推荐） |

**完整示例**：

```bash
yarn node scripts/import-wechat.mjs \
  "https://mp.weixin.qq.com/s/Go9LDui7kx-rsMhVXwxR6g" \
  --category 通知公告 \
  --tags 开学,通知
```

**脚本会自动完成**：

1. 提取标题、公众号名称、发布时间作为元数据
2. 清理懒加载占位符，将正文转为 Markdown
3. **下载正文图片到 `public/assets/news/`** 并改写为本地路径（微信图片有防盗链，本地化避免失效）
4. 在 `src/content/news/<年>/<月>/` 生成 `.md` 文件，并写入 `source` 字段记录原文链接

导入的文章会自动获得转载标识：

- 列表页标题前显示「转」徽章
- 详情页标题上方显示「转载文章」横幅
- 文末显示版权声明卡及「阅读原文」原文链接

手动撰写的文章没有 `source` 字段，不会显示这些标识。

导入后运行 `yarn dev` 即可在 `/news` 页面看到新文章。

> ⚠️ 注意：仅用于转载本校官方公众号的公开文章，请尊重原作者版权。

## 🌐 自动部署

主分支(master)更新触发GitHub Action自动部署

## 🤝 参与贡献

我们欢迎各种形式的贡献！

### 开发流程

1. Fork 本项目
2. 创建特性分支 
(`git checkout -b feature/AmazingFeature`)
3. 提交更改 
(`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 
(`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### Commit规范
采用[Conventional Commits](https://www.conventionalcommits.org/)标准：
```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

常用类型：
- feat: 新功能
- fix: bug修复
- docs: 文档变更
- style: 代码样式
- refactor: 代码重构
- test: 测试相关
- chore: 构建/工具变更

参考文章 [使用 commitizen 规范 Git 提交说明](https://zhuanlan.zhihu.com/p/137135338)

## 📧 联系我们

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/pnxzx/pnxzx.github.io/issues)
- 发送邮件至：lyxyz5223@qq.com

## ⚠️ 免责声明

本项目为非官方网站，与任何教育机构无官方关联。所有信息仅供参考，请以学校官方发布的信息为准。

 
---

⭐ 如果这个项目对您有帮助，请给我们一个星标！