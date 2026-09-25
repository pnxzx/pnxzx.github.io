# pnxzx.github.io

## 🌟 项目简介

这是一个使用现代前端技术栈开发的非官方学校网站，旨在学习前端知识

## 🚀 技术栈

- **框架**: [Vue3](https://cn.vuejs.org/)
- **包管理器**: Yarn 4
- **构建工具**: Vite
- **路由**: Vue Router
- **内容处理**: marked + gray-matter + DOMPurify（Markdown 新闻）

## 推荐的 IDE 设置

推荐使用 [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（并禁用 Vetur）。

## 📁 项目结构

```
pnxzx.github.io/
├── public/                 # 静态资源
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

### 计划功能
- [ ] 更多页面

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