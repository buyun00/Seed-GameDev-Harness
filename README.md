<img src="assets/logo.jpg" alt="Seed" width="300" />

# Seed

**通用 LLM 知识管理与多 Agent 协作平台**

一站式管理项目知识资产（规则集 / 自动记忆 / 项目知识），内置多模型 LLM 接入和多 Agent 实时协作看板。

---

## 快速启动

### 前置要求

- **Node.js** >= 18.0.0
- 一个 LLM API Key（OpenAI / Anthropic / DeepSeek / 通义千问 / Gemini 任选其一）

### 方式一：克隆后直接运行

```bash
# 克隆项目
git clone https://github.com/your-username/Seed-GameDev-Harness.git
cd Seed-GameDev-Harness

# 安装依赖并自动构建
npm install

# 启动服务
npm start
```

`npm start` 会自动：
1. 检查后端构建产物是否存在，缺失则自动构建
2. 启动 Worker 服务
3. 自动在浏览器中打开 `http://127.0.0.1:18080/`

首次使用请在页面右上角点击 **⚙️ API 设置**，配置你的 API Key。

### 方式二：含预构建产物的快速启动

如果仓库中已包含 `memory-server/dist/` 的预构建产物，可直接：

```bash
npm install              # 仅安装根依赖（约 10 秒）
npm start                # 跳过构建，直接启动
```

### 方式三：手动构建

```bash
# 完整构建（含安装依赖）
npm run build

# 或跳过依赖安装（如果已装过）
npm run build:skip-install

# 启动
npm start
```

---

## 功能概览

### 🤖 虚拟工作室

实时 Agent 状态看板 + LLM 对话界面：

- **Agent 团队看板** — 6 个虚拟 Agent（Leader / Builder / Researcher / Reviewer / Unity Pilot / Chat）的实时工作状态（空闲/工作中/等待/已完成/异常），通过 SSE 实时推送
- **LLM 对话** — 支持流式输出的 AI 对话，带历史记录持久化
- **多模型支持** — 可同时配置多个模型供应商，快速切换

### 📋 规则集管理（Constitution）

管理 `CLAUDE.md` 中的规则块：

- 自动提取和分类规则
- 检测规则冲突 / 遮蔽 / 冗余关系
- AI 辅助提案修改

### 🧠 自动记忆（Auto Memory）

管理项目级记忆对象：

- 自动发现记忆路径
- 索引健康检查
- 主题内容编辑

### 📚 项目知识（Project Knowledge）

管理项目文档和知识资产：

- 自动分类
- 层级关联标注
- 一键蒸馏为规则或记忆

---

## 支持的大模型

| 供应商 | 默认模型 | 获取 API Key |
|--------|----------|-------------|
| **OpenAI** | gpt-4o | https://platform.openai.com/api-keys |
| **Anthropic (Claude)** | claude-sonnet-4-20250514 | https://console.anthropic.com/settings/keys |
| **Google Gemini** | gemini-2.5-flash | https://aistudio.google.com/app/apikey |
| **DeepSeek** | deepseek-chat | https://platform.deepseek.com/api_keys |
| **通义千问 (Qwen)** | qwen-plus | https://bailian.console.aliyun.com/ |

支持任意兼容 OpenAI API 格式的自定义服务地址。

---

## 配置持久化

所有配置自动持久化到项目根目录的 `.seed/settings.json` 文件：

| 配置项 | 说明 |
|--------|------|
| API 配置 | 模型供应商、API Key、模型名、API 地址 |
| 主题偏好 | 深色 / 浅色模式 |
| 语言设置 | 中文 / English / 日本語 / 한국어 |
| 聊天记录 | 对话历史（最多 200 条） |

启动时自动从文件恢复，关闭浏览器不丢失。

---

## 主题与界面

- **深色/浅色主题** — 导航栏底部一键切换
- **多语言** — 支持中/英/日/韩四种界面语言
- **赛博朋克风格** — 动态渐变背景，浮动粒子效果

---

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + Vite + TypeScript + Pinia |
| 后端 | Hono + Node.js |
| 实时 | SSE (Server-Sent Events) |
| Markdown | marked |
| 打包 | esbuild（后端）+ Vite（前端） |

---

## 项目结构

```
Seed-GameDev-Harness/
├── start.mjs                 # 启动入口
├── package.json              # 根 package
├── scripts/
│   └── postinstall.mjs       # 安装后自动构建脚本
├── memory-server/
│   ├── server/               # 后端 TypeScript 源码
│   │   ├── core/             # 核心模块（Scanner/Watcher/Cache/Writer）
│   │   ├── http/             # HTTP API 路由
│   │   │   └── routes/       # 各业务路由
│   │   ├── sse/              # SSE 推送
│   │   ├── worker/           # Worker 管理与任务队列
│   │   │   ├── agents/       # Agent 实现
│   │   │   └── queue/        # 任务队列
│   │   └── analyzers/        # 分析器（Constitution/Memory/Knowledge）
│   ├── src/                  # 前端 Vue 3 源码
│   │   ├── pages/            # 页面
│   │   ├── stores/           # Pinia 状态管理
│   │   ├── api/              # API 客户端
│   │   ├── i18n/             # 国际化
│   │   ├── layouts/          # 布局
│   │   └── components/       # 公共组件
│   ├── dist/                 # 预构建产物（提交到仓库）
│   │   ├── server/           # 后端构建输出
│   │   └── client/           # 前端构建输出
│   └── package.json
├── .seed/                    # 运行时数据（不提交到仓库）
│   └── settings.json         # 持久化配置
└── .gitignore
```

---

## 开发

```bash
# 前端 + 后端热更新开发
cd memory-server && npm run dev
```

前端 Vite 开发服务器默认端口 5173，后端 Hono 端口 18080。

---

## License

MIT License

Copyright (c) 2025 Seed
