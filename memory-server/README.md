# Memory Server

Seed 记忆编辑器 — 一个本地运行的 Worker 服务 + Web UI，用于可视化管理 Claude Code 项目中的三大知识层级：**Constitution（规则宪法）**、**Auto Memory（自动记忆）**、**Project Knowledge（项目知识）**。

## 它解决什么问题

Claude Code 的知识体系分散在 `CLAUDE.md`、`.claude/rules/`、`~/.claude/projects/<slug>/memory/`、`docs/` 等多处文件中，缺乏统一的结构化视图。Memory Server 将这些知识抽象为可浏览、可编辑、可审计的对象，并通过 Claude Agent SDK（或 `claude --print` CLI fallback）完成 AI 分析和改写，所有修改必须经过 **Proposal → Diff 审查 → 用户确认** 才会写入文件。

## 核心特性

- **Worker 架构** — 按项目隔离的后台 Worker 进程，PID 管理、健康检查、优雅关闭
- **MCP Server** — 注册 12+ tools，可被 Claude Code 直接调用，支持 Proxy 模式
- **本地 Web UI** — Vue 3 + Semi Design Vue，提供三大页面的可视化管理
- **Constitution 分析** — AI 提取 CLAUDE.md 中的规则块，检测冲突/遮蔽/冗余关系
- **Auto Memory 管理** — 自动发现 Claude Code 的 memory 目录（兼容 worktree、settings 覆盖），展示索引状态
- **Project Knowledge 蒸馏** — 浏览项目文档，一键蒸馏为 rule 或 memory 条目
- **后台任务队列** — LLM 密集型任务异步处理，SSE 实时推送进度
- **Proposal 系统** — 所有 AI 修改先生成 Proposal（含 unified diff），用户确认后原子写入 + `.bak` 备份
- **SSE 实时推送** — 文件变化、分析进度、任务状态实时同步到前端
- **安全** — 仅绑定 `127.0.0.1`，HttpOnly bootstrap cookie 认证，无 token 暴露

## 系统架构

```
┌─────────────┐                   ┌──────────────────────────────────────┐
│ Claude Code  │   SessionStart   │       Worker Process (per project)    │
│  (Hooks)    │──────────────────►│                                      │
└─────────────┘                   │  WorkerService                       │
                                  │  ├── Hono HTTP Server (127.0.0.1)    │
┌─────────────┐                   │  │   ├── API Routes                  │
│  MCP Server │  ensureWorker +   │  │   ├── SSE Endpoint                │
│  (stdio)    │──HTTP proxy──────►│  │   └── Static File Server          │
└─────────────┘                   │  ├── Scanner + Watcher               │
                                  │  ├── Task Queue                      │
  ┌──────────┐   REST + SSE      │  ├── Agent SDK Services              │
  │  Web UI  │◄─────────────────►│  └── PID File (~/.seed/workers/)     │
  │ (Vue 3)  │   HttpOnly cookie │                                      │
  └──────────┘                   └──────────────────────────────────────┘
```

## 前置要求

- **Node.js** >= 18
- **npm** >= 9
- **Claude Code CLI**（`claude` 命令可用）— Constitution 分析和编辑需要 Agent SDK 或 `claude --print`

## 快速开始

### 1. 安装依赖

```bash
cd memory-server
npm install
```

### 2. 开发模式

同时启动前端 dev server（热更新）和后端 worker：

```bash
npm run dev
```

前端默认运行在 Vite dev server 上，后端 API 请求通过 Vite proxy 转发。

### 3. 生产构建 & 运行

```bash
npm run build
npm start
```

构建产物：
- `dist/client/` — Vue 前端静态资源
- `dist/worker.cjs` — 自包含 Node.js 后端 bundle

启动后终端会输出：

```
[Seed Worker] Serving D:/path/to/project
[Seed Worker] URL: http://127.0.0.1:<port>/
```

在浏览器中打开该 URL 即可访问 Web UI（cookie 自动建立）。

### 4. 指定目标项目

默认以当前目录作为目标项目。可通过 `--project-path` 指定：

```bash
# Worker daemon 模式
node dist/worker.cjs daemon --project-path /path/to/your/project

# start 命令（后台 spawn）
node dist/worker.cjs start --project-path /path/to/your/project
```

### 5. 作为 Seed 插件使用

在 Claude Code 中安装 Seed 插件后，worker 会在 SessionStart 时自动拉起，无需手动操作。

## 三大页面

### Constitution（规则宪法）

管理 `CLAUDE.md`、`.claude/CLAUDE.md`、`CLAUDE.local.md` 中的规则。

- **分析**：调用 Claude AI 提取规则块，标注状态（effective / shadowed / conflicting / unresolved）
- **查看**：按状态分 Tab 浏览，点击查看规则详情、来源位置、关系图
- **编辑**：在侧面板中修改规则，生成 Proposal，审查 diff 后应用
- **源文档**：直接查看和对比三个源文件

### Auto Memory（自动记忆）

管理 Claude Code 自动维护的 memory 文件。

- **路径发现**：兼容 Claude Code 官方路径解析（settings 覆盖 → git common dir → slugify）
- **索引检查**：对比 `MEMORY.md` 索引与实际 topic files，标记未索引/过期/重复
- **筛选浏览**：按类型（user/feedback/project/reference）和状态筛选
- **编辑**：通过 Proposal 系统安全修改 memory 文件

### Project Knowledge（项目知识）

浏览和管理 `.claude/rules/`、`docs/`、`architecture/`、`research/` 等目录下的文档。

- **自动分类**：基于路径规则自动归入 rules / architecture / research 等类别
- **层级关联**：标注文档与 Constitution / Memory 层的关联性
- **蒸馏**：一键将文档蒸馏为 Constitution rule 或 Memory 条目

## HTTP API

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | 健康检查（免 auth） |
| `/api/auth/bootstrap` | GET | 建立 session cookie（免 auth，localhost only） |
| `/api/admin/shutdown` | POST | 优雅关闭 worker |
| `/api/status` | GET | 服务状态 |
| `/api/events` | GET | SSE 实时事件流 |
| `/api/tasks` | GET | 任务列表 |
| `/api/tasks/:id` | GET | 任务详情 |
| `/api/tasks/:id` | DELETE | 取消任务 |
| `/api/constitution` | GET | Constitution 分析状态与规则 |
| `/api/constitution/sources` | GET | 源文件内容 |
| `/api/constitution/analyze` | POST | 触发分析 |
| `/api/constitution/propose-edit` | POST | 提交编辑 Proposal |
| `/api/constitution/propose-create` | POST | 提交新建 Proposal |
| `/api/auto-memory` | GET | Memory 列表 |
| `/api/auto-memory/:id` | GET | 单个 memory 详情 |
| `/api/auto-memory/propose-edit` | POST | 提交 memory 编辑 |
| `/api/auto-memory/reindex` | POST | 重建索引 |
| `/api/project-knowledge` | GET | 知识对象列表 |
| `/api/project-knowledge/:id` | GET | 单个知识对象 |
| `/api/project-knowledge/distill` | POST | 蒸馏 |
| `/api/proposals` | GET | Proposal 列表 |
| `/api/proposals/:id` | GET | Proposal 详情 |
| `/api/proposals/:id/apply` | POST | 应用 Proposal |
| `/api/proposals/:id/reject` | POST | 拒绝 Proposal |

## 项目目录结构

```
memory-server/
├── server/                    # 后端 (TypeScript)
│   ├── index.ts               # CLI 入口 (start/stop/restart/status/daemon)
│   ├── worker/                # Worker 基础设施
│   │   ├── worker-service.ts  # 主服务类
│   │   ├── process-manager.ts # PID 管理 + 路径规范化
│   │   ├── spawner.ts         # 后台 spawn + 健康检查
│   │   ├── queue/             # 后台任务队列
│   │   └── agents/            # Agent SDK 服务
│   ├── mcp/                   # MCP Server + tools
│   ├── http/                  # Hono HTTP 路由 + 中间件
│   ├── sse/                   # SSE 事件系统
│   ├── core/                  # 核心模块 (Scanner, Watcher, Cache, Writer...)
│   ├── models/                # 数据模型
│   ├── analyzers/             # 分析器 (Constitution, Memory, Knowledge)
│   └── utils/                 # 工具函数
├── src/                       # 前端 (Vue 3 + TypeScript)
│   ├── pages/                 # 三大页面
│   ├── components/            # 通用组件 + Proposal UI + Vditor 封装
│   ├── stores/                # Pinia stores
│   ├── api/                   # API 客户端
│   ├── composables/           # Vue composables (SSE, Proposal...)
│   └── styles/                # 全局样式
├── dist/                      # 构建产物
│   ├── client/                # 前端静态资源
│   └── worker.cjs             # 自包含后端 bundle
└── .seed-memory/              # 运行时数据 (自动创建)
    ├── cache/                 # 分析缓存
    └── proposals/             # Proposal JSON 文件
```

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | Vue 3 + Vite + TypeScript |
| UI 组件库 | Semi Design Vue (`@kousum/semi-ui-vue`) |
| Markdown 编辑器 | Vditor |
| 状态管理 | Pinia |
| HTTP 请求 | Axios |
| 后端框架 | Hono + `@hono/node-server` |
| MCP SDK | `@modelcontextprotocol/sdk` |
| Agent SDK | `@anthropic-ai/claude-agent-sdk` (optional) |
| 文件监听 | chokidar |
| Markdown 解析 | remark + gray-matter |
| Diff 生成 | diff |
| 构建打包 | esbuild (worker) + Vite (client) |
| 实时推送 | SSE (Server-Sent Events) |

## 安全说明

- HTTP Server 仅绑定 `127.0.0.1`，不暴露到网络
- 鉴权通过 `GET /api/auth/bootstrap` 建立 HttpOnly cookie，token 不出现在 URL/HTML/PID 文件中
- dev 和 prod 走完全相同的 auth 路径，无 `NODE_ENV` 放行
- 所有文件写入先创建 `.bak` 备份，使用 `write-tmp-rename` 原子操作
- AI 修改必须经过 Proposal 审查，不会直接写文件

## License

Private project.
