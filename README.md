<img src="assets/logo.jpg" alt="Seed" width="300" />

# Seed

**AI Workflow System for Game Development**

基于 Claude Code Plugin 的游戏研发 AI 工作流系统  
动态 Agent 组装 · CC Native Team 编排 · 项目记忆持久化 · Fragment-based Skill 注入

---

## 什么是 Seed

Seed 是一个专为游戏研发场景设计的 Claude Code 插件。它的核心能力是根据任务特征（类型、领域、复杂度）自动选择合适的 Agent 组合，通过 Claude Code 原生 Agent Team 机制协调执行，并跨 session 保持项目上下文。

Seed **不是**通用 AI 编排框架——它专注于游戏开发领域，内置了面向 Unity / Godot / Unreal / Cocos 的引擎主线知识，以及 Lua、配置表、网络、CI/CD、工具链等跨引擎能力知识。

### 核心特性

- **动态 Agent 组装** — 根据任务的 `task_kind` / `domain` / `complexity` 三个维度自动路由到最优 Agent 组合
- **CC Native Team 编排** — 直接使用 Claude Code 原生 Agent Team（`TeamCreate` / `TaskCreate` / `SendMessage`），不维护任何自己的进程
- **项目记忆持久化** — `.seed/project-memory.json` 存储长期项目知识，每次 session 自动注入，抗 compact
- **Fragment-based Skill 注入** — 按 prompt 关键词匹配，自动注入相关技能片段到上下文
- **Context Guard** — 监控上下文使用率，超阈值自动提醒 `/compact`
- **Memory Editor** — 本地 Web UI 可视化管理三大知识层（Constitution / Auto Memory / Project Knowledge），内置后台 Worker 服务和 Agent SDK 任务队列

---

## 安装

Seed 仅支持通过 Claude Code Plugin 机制安装：

```bash
# 1. 添加 marketplace 仓库
/plugin marketplace add https://github.com/buyun00/Seed-GameDev-Harness.git

# 2. 安装插件
/plugin install seed

# 3. 运行初始化向导
/seed:setup
```

### 安装流程详解

安装分三个阶段自动执行：


| 阶段                 | 触发时机                    | 做什么                                                                                           |
| ------------------ | ----------------------- | --------------------------------------------------------------------------------------------- |
| `plugin-setup.mjs` | `/plugin install` 后自动执行 | 保存 Node 路径到 `~/.claude/.seed-config.json`，将 `hooks.json` 的 `node` 替换为绝对路径（兼容 nvm/fnm/Windows） |
| `setup-init.mjs`   | 首次打开 CC session         | 创建 `.seed/state`、`.seed/logs`、`.seed/plans` 目录结构                                              |
| `/seed:setup`      | 用户手动运行                  | 语言选择、安装 CLAUDE.md、写入默认配置、启用 Agent Teams、创建 `/seed` 快捷命令、引导运行 `/seed:embed`                |


### `/seed:setup` 五阶段向导

1. **语言选择** — 选择交互语言（English / 中文 / 日本語 / 한국어），后续所有提问、文档输出、注释均使用选定语言
2. **CLAUDE.md 安装** — 选择 local（`.claude/CLAUDE.md`）或 global（`~/.claude/CLAUDE.md`），安装 Seed 核心指令
3. **默认配置写入（静默）** — 自动写入 `.seed/config.json`、启用 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`、创建 `/seed` 快捷命令
4. **引导运行 /seed:embed** — 提示用户重启 Claude Code 后运行 `/seed:embed` 分析项目技术栈
5. **完成确认** — 写入 `setupCompleted` 标记

---

## 使用

### 命令体系

| 命令 | 性质 | 说明 |
|------|------|------|
| `/seed` | 日常入口 | 项目快捷命令，转发到 `/seed:bud`。由 `/seed:setup` 自动创建到 `.claude/commands/seed.md` |
| `/seed:setup` | 一次性初始化 | 语言选择、CLAUDE.md 安装、默认配置写入、引导运行 embed |
| `/seed:embed` | 项目画像扫描 | 扫描引擎、语言分布、语言职责和目录结构，写入项目记忆 |
| `/seed:bud` | 底层引擎 | 实际的 bud 命令实现（通常通过 `/seed` 调用，无需直接使用） |

> **提示**：如果输入包含"配置/config/设置/改一下"等关键词，`/seed` 会提示你运行 `/seed:setup`，不会继续执行任务组装。

#### `/seed` — 动态组装 Agent Team

```bash
/seed 实现跳跃手感优化
/seed --auto 调查帧率下降问题
/seed --confirm Review the new combat system
/seed --guided 重构战斗系统架构
```

模式：

| 模式 | 行为 | 适用场景 |
|---|---|---|
| `auto` | 分析后直接启动 | 日常使用 |
| `confirm` | 展示方案，一次确认后启动 | 需要确认方案 |
| `guided` | 逐步引导，可调整参数 | 首次使用或复杂任务 |

### `/seed:embed`

```bash
/seed:embed          # 扫描并覆盖当前项目画像
/seed:embed --check  # 只扫描并展示摘要，不写入文件
```

扫描内容：

- 主引擎与版本，例如 Unity 2022.3.15f1。
- 脚本/代码语言分布，例如 C#、Lua、GDScript、TypeScript。
- 语言职责判断，例如 Lua = gameplay primary，C# = Unity host/bridge/tooling。
- 关键目录地图：路径、用途、证据、置信度。

写入文件：

- `.seed/project-memory.json`
- `.seed/project-profile.md`

---

## Agent 角色

| Agent | 定位 | 职责 | 限制 |
|---|---|---|---|
| `leader` | 常驻协调者 | 方向仲裁、计划维护、closeout 签字 | 不直接实现代码 |
| `builder` | 实现主力 | 编写代码、修复 bug、交付功能 | 方向选择必须升级给 leader |
| `researcher` | 按需调查员 | 信息收集、根因分析、调查报告 | 不写/编辑文件 |
| `reviewer` | 按需审查员 | 代码审查、方案审查 | 不写/编辑文件 |
| `unity-pilot` | Unity 操作员 | Unity Editor 操作、Play Mode 验证 | 不写 C# 逻辑代码 |

---

## 记忆系统

| 层 | 文件 | 用途 | 写入时机 | 读取时机 |
|---|---|---|---|---|
| Project Memory | `.seed/project-memory.json` | 长期项目知识：tech stack、project profile、hot paths、directives | `/seed:embed` 和 PostToolUse | SessionStart / PreCompact |
| Project Profile | `.seed/project-profile.md` | 人类可读项目画像 | `/seed:embed` | 用户审阅 |
| Notepad | `.seed/notepad.md` | 会话笔记：Priority Context / Working Memory / Manual Notes | Agent 主动维护 | SessionStart |

项目记忆注入保持短摘要，包含 `[Project Environment]`、`[Project Profile]`、`[Hot Paths]`、`[Directives]` 和 `[Recent Learnings]`。

---

## Memory Editor（记忆编辑器）

Memory Editor 是 Seed 内置的本地 Web UI，用于可视化管理 Claude Code 项目中的三大知识层级。它在 Claude Code session 启动时自动拉起一个按项目隔离的后台 Worker 进程，提供 HTTP API + SSE 实时推送 + 静态页面托管。

### 解决什么问题

Claude Code 的知识体系分散在 `CLAUDE.md`、`.claude/rules/`、`~/.claude/projects/<slug>/memory/`、`docs/` 等多处文件中，缺乏统一的结构化视图。Memory Editor 将这些知识抽象为可浏览、可编辑、可审计的对象，所有 AI 修改必须经过 **Proposal → Diff 审查 → 用户确认** 才会写入文件。

### 三大管理页面

| 页面 | 管理对象 | 核心能力 |
|------|----------|----------|
| **Constitution** | `CLAUDE.md`、`.claude/CLAUDE.md`、`CLAUDE.local.md` | AI 提取规则块，检测冲突/遮蔽/冗余关系，锚定式安全回写 |
| **Auto Memory** | `~/.claude/projects/<slug>/memory/` | 路径自动发现（兼容 worktree/settings），索引健康检查，topic 编辑 |
| **Project Knowledge** | `.claude/rules/`、`docs/`、`architecture/` 等 | 自动分类，层级关联标注，一键蒸馏为 rule 或 memory |

### 架构概览

```
Claude Code SessionStart → Hook 自动启动 Worker
                                    │
                        ┌───────────▼───────────────┐
                        │   Worker (per project)     │
                        │   Hono HTTP + SSE          │
                        │   Scanner + Watcher        │
                        │   Task Queue + Agent SDK   │
                        │   PID: ~/.seed/workers/    │
                        └───────────┬───────────────┘
                                    │
               ┌────────────────────┼─────────────────────┐
               │                    │                      │
          Web UI (Vue 3)    MCP Server (tools)    API (REST + SSE)
         HttpOnly cookie      共享服务层           供前端/MCP 使用
```

**关键设计**：

- **按项目隔离**：每个 Git 工作树各自独立 Worker（PID/端口/扫描/缓存完全隔离），子目录自动合并到工作树根
- **Bootstrap Cookie 鉴权**：无 token 暴露（不在 URL/HTML/PID 文件中），通过 `GET /api/auth/bootstrap` 建立 HttpOnly session cookie，dev/prod 完全一致
- **后台任务队列**：LLM 密集型任务（Constitution 分析、Proposal 生成等）异步处理，SSE 实时推送进度，同步 API 兼容包装（超时降级到轮询）
- **Agent SDK + CLI Fallback**：优先使用 `@anthropic-ai/claude-agent-sdk`，不可用时自动 fallback 到 `claude --print`
- **esbuild 自包含 Bundle**：后端打包为单个 `dist/worker.cjs`，无需额外 `npm install`

### 使用方式

Memory Editor 在正常使用 Seed 插件时**自动启动**，无需手动操作：

1. 打开 Claude Code session → SessionStart hook 自动拉起 Worker
2. 终端输出 `[Seed Worker] URL: http://127.0.0.1:<port>/`
3. 浏览器打开该 URL → 自动建立 session → 进入管理界面

手动管理：

```bash
# 查看状态
npm run worker:status -- --project-path /path/to/project

# 手动启停
npm run worker:start -- --project-path /path/to/project
npm run worker:stop -- --project-path /path/to/project

# 开发模式（热更新）
cd memory-server && npm run dev
```

### 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + Vite + TypeScript + Semi Design Vue + Vditor |
| 后端 | Hono + Node.js + esbuild bundle |
| 实时 | SSE (Server-Sent Events) |
| AI | Claude Agent SDK / `claude --print` CLI |
| MCP | `@modelcontextprotocol/sdk` |

详细文档参见 [`memory-server/README.md`](memory-server/README.md)。

---

## Skill 注入

`skill-injector` 会在用户 prompt 提交时扫描 `.seed/skills/` 和插件内置 `skills/`，按 YAML frontmatter 的 `triggers` 匹配并注入相关片段。

| Skill | 目录 | 内容 |
|---|---|---|
| `unity-patterns` | `skills/` | Unity 开发模式和最佳实践 |
| `lua-scripting` | `skills/` | Lua / xLua 热更新脚本开发指南 |
| `ai-pipeline` | `skills/` | AI 工作流和 MCP 集成模式 |
| `mcp-tools` | `skills/` | MCP 工具开发和调试指南 |
| `detect-tech-stack` | `skills/` | 简化项目画像扫描规范 |
| method skills | `skills/method/` | implement / debug / review / verify / config-change 方法论 |
| researcher skills | `skills/` | researcher-spec-builder / current-task-contract-creator / delivery-contract-creator / domain-context-creator |

在 `.seed/skills/` 下创建 `.md` 文件可以添加项目级 learned skills。

---

## 项目结构

```text
seed/
├── .claude-plugin/
├── assets/
├── hooks/
├── scripts/
│   ├── worker-service.cjs               # Memory Editor Worker 管理入口
│   ├── worker-start.mjs                 # SessionStart Worker 启动 Hook
│   ├── embed-project-profile.mjs        # /seed:embed 项目画像扫描脚本
│   ├── project-memory-session.mjs       # SessionStart 注入项目记忆
│   ├── project-memory-posttool.mjs      # PostToolUse 更新 hot paths
│   ├── project-memory-precompact.mjs    # PreCompact 注入记忆摘要
│   ├── skill-injector.mjs               # UserPromptSubmit skill 注入
│   ├── researcher-copy-template.mjs    # researcher 模板复制
│   ├── researcher-list-options.mjs     # researcher MF/Tool 列举
│   ├── researcher-fill-options.mjs     # researcher MF/Tool 填充
│   ├── researcher-inject-section.mjs   # researcher 占位符注入
│   └── lib/
│       ├── atomic-write.mjs
│       ├── memory-formatter.mjs
│       └── i18n.mjs
├── commands/
│   ├── setup.md                         # /seed:setup
│   ├── embed.md                         # /seed:embed 项目画像扫描
│   └── bud.md                           # /seed:bud
├── agents/
├── skills/
│   ├── detect-tech-stack.md             # 简化扫描规范
│   ├── method/
│   ├── researcher-spec-builder/        # researcher spec 构建主流水线
│   ├── current-task-contract-creator/  # CTC 生成器
│   ├── delivery-contract-creator/      # DC 生成器
│   ├── domain-context-creator/         # Domain Context 收集器
│   └── seed-reference/
├── memory-server/                       # Memory Editor 完整子项目
│   ├── server/                          # 后端（Worker + HTTP + MCP + Agent SDK）
│   ├── src/                             # 前端（Vue 3）
│   ├── dist/                            # 构建产物（worker.cjs + client/）
│   └── package.json
├── templates/
│   ├── config.json
│   ├── task.md
│   ├── team-router.md
│   └── researcher/                     # researcher spec 模板与片段库
│       ├── researcher.md
│       ├── mf/
│       └── tools/
├── .mcp.json
└── package.json
```

### 运行时生成

```text
<your-project>/
├── .seed/
│   ├── config.json
│   ├── project-memory.json
│   ├── project-profile.md
│   ├── notepad.md
│   ├── team-router.md
│   ├── state/
│   ├── logs/
│   ├── plans/
│   ├── output/                    # researcher spec 工作文件输出
│   └── skills/
└── .claude/
    ├── CLAUDE.md
    └── commands/
        └── seed.md
```

---

## 配置

`.seed/config.json` 默认模板：

```json
{
  "language": "",
  "bud": {
    "mode": "auto"
  },
  "embed": {
    "maxDirectoryEntries": 80,
    "writeMarkdownProfile": true
  },
  "memory": {
    "autoLearn": true,
    "rescanIntervalHours": 24
  },
  "contextGuard": {
    "threshold": 75,
    "maxBlocks": 2
  },
  "skillInjector": {
    "maxPerSession": 5
  }
}
```

| 配置项 | 说明 | 默认值 |
|---|---|---|
| `language` | 交互语言 | setup 时选择 |
| `bud.mode` | `/seed` 默认执行模式 | `auto` |
| `embed.maxDirectoryEntries` | `/seed:embed` 最多写入的目录画像条数 | `80` |
| `embed.writeMarkdownProfile` | 是否写入 `.seed/project-profile.md` | `true` |
| `memory.autoLearn` | 自动学习项目知识 | `true` |
| `memory.rescanIntervalHours` | 记忆重扫间隔 | `24` |
| `contextGuard.threshold` | Context 使用率告警阈值 | `75` |
| `contextGuard.maxBlocks` | 最大 block 次数 | `2` |
| `skillInjector.maxPerSession` | 每个 session 最多注入 skill 数 | `5` |

---

## 测试

```bash
npm run check
npm test
```

---

## 当前范围

Seed 目前专注于：

- Claude Code Plugin 安装和运行。
- Claude Code 原生 Agent Team 协作。
- 游戏研发项目的任务路由、项目画像、记忆注入和 skill 注入。
- Memory Editor：知识层可视化管理、Constitution 分析、Proposal 审查。

暂未纳入：

- npm 全局安装方式。
- tmux / CLI 终端编排模式。
- Codex / Gemini 等其他 AI backend 接入。
- HUD / analytics / session learner 等监控功能。

---

## License

MIT

## 彩蛋：关于名字

Seed 的名字来自《刀剑神域》（Sword Art Online）中的 **The Seed**：一个可以复制完整虚拟世界的程序包，创造无数游戏世界的起点。

把 Seed 种进你的游戏项目，它会在代码库里生根发芽：记住你的技术栈，沉淀项目的专属记忆，并在每次需要时召唤合适的 Agent 组合与你并肩工作。
