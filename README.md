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
| `/seed:embed` | 项目分析 | 按双轴矩阵分析项目技术栈，生成项目专属 domain skill。可随时重跑（`--update` 增量模式） |
| `/seed:bud` | 底层引擎 | 实际的 bud 命令实现（通常通过 `/seed` 调用，无需直接使用） |

> **提示**：如果输入包含"配置/config/设置/改一下"等关键词，`/seed` 会提示你运行 `/seed:setup`，不会继续执行任务组装。

#### `/seed` — 动态组装 Agent Team

```bash
# 默认使用 config 中的模式
/seed 实现跳跃手感优化

# 指定模式
/seed --auto 调查帧率下降问题
/seed --confirm Review the new combat system
/seed --guided 重构战斗系统架构
```

**三种执行模式：**


| 模式        | 行为            | 适用场景                   |
| --------- | ------------- | ---------------------- |
| `auto`    | 分析后直接启动，不打断用户 | 日常使用推荐（默认）             |
| `confirm` | 展示方案，一次确认后启动  | 需要确认方案时使用               |
| `guided`  | 逐步引导，可调整每个参数  | 首次使用，或需要精细控制 Agent 组合  |


**执行流程：**

1. **配置意图拦截** — 检测"配置/设置"类关键词，命中则提示运行 `/seed:setup`
2. **任务分析** — 自动识别 `task_kind`（implement / investigate / fix / review / design / operate）、`domain`、`complexity`
3. **查路由表** — 根据分析结果查 `.seed/team-router.md`，选择 Agent 组合
4. **确认/调整** — 根据模式展示方案并确认
5. **启动 Team** — 调用 `TeamCreate` → `TaskCreate` × N → `SendMessage` → leader

#### `/seed:embed` — 分析项目技术栈

```bash
/seed:embed            # 全量模式：重新生成所有 domain skill
/seed:embed --update   # 增量模式：只生成缺失的 skill
```

扫描项目结构后，Seed 会按**双轴矩阵**整理结果：

- 引擎主线方向：Unity / Godot / Unreal / Cocos 各自的项目结构、场景生命周期、脚本层、桥接层、UI、热更新、资源管线等方向
- 跨引擎能力：Lua 嵌入、配置/Protobuf、网络协议与同步、构建发布/CI/CD、工具链与 AI pipeline

经用户确认后，通过 Agent Team 并行生成项目专属的 domain skill 文件到 `.seed/skills/domain/`。新产物统一命名为：

- `domain/<engine>-<direction>.md`
- `domain/common-<capability>.md`

/seed:embed 会分两阶段执行：Phase A 先按 wave 派出 researcher 调查并把 yaml 报告落盘到 `.seed/state/embed/<stamp>/reports/`，Phase B 再派出 `builder-engine` / `builder-common` 两个合并 builder 读取报告写 skill。默认配置下峰值并发 ≤ 5。

可随时重跑，项目中途换方案、新增模块都可以。

#### `/seed:setup` — 初始化配置

首次安装后运行，后续可重新运行来更新配置。

---

## Agent 角色

Seed 内置 5 个 Agent 角色，根据任务自动组合：


| Agent           | 定位    | 职责                                | 限制                 |
| --------------- | ----- | --------------------------------- | ------------------ |
| **leader**      | 常驻协调者 | 方向仲裁、计划维护、closeout 签字             | 不直接实现代码            |
| **builder**     | 实现主力  | 编写代码、修复 bug、交付功能                  | 方向选择必须升级给 leader   |
| **researcher**  | 按需调查员 | 信息收集、根因分析、产出调查报告                  | 不能 Write / Edit 文件 |
| **reviewer**    | 按需审查员 | 代码审查、方案审查、产出审查意见                  | 不能 Write / Edit 文件 |
| **unity-pilot** | 按需操作员 | Unity Editor 操作、场景编辑、Play Mode 验证 | 不写 C# 逻辑代码         |


### 升级原则

以下情况 teammate **必须**升级给 leader，不得自行决策：

- 实现方案有多个方向可选
- 发现依赖关系变化影响其他任务
- 遇到 Risk Level = high 的情况
- 任何"要不要改这个"的疑问

---

## 记忆系统

### 两层存储


| 层                  | 文件                          | 用途                                      | 写入时机                       | 读取时机                       |
| ------------------ | --------------------------- | --------------------------------------- | -------------------------- | -------------------------- |
| **Project Memory** | `.seed/project-memory.json` | 长期项目知识（tech stack、hot paths、directives） | PostToolUse（Write/Edit 触发） | 每次 SessionStart            |
| **Notepad**        | `.seed/notepad.md`          | 会话笔记，三段式结构                              | Agent 主动调用                 | SessionStart 注入 Priority 段 |


### Notepad 三段式结构

```markdown
## Priority Context
（抗 compact，每次 session 自动注入）

## Working Memory
（当前任务的工作记忆）

## Manual Notes
（手动添加的笔记）
```

### PreCompact 保护

Compact 前会自动读取 `project-memory.json` 格式化为摘要，作为 `systemMessage` 返回给 CC，确保关键上下文不因 compact 丢失。

---

## Skill 注入

### 工作原理

每次用户发送 prompt 时，`skill-injector` 会：

1. 扫描 prompt（小写匹配）
2. **递归遍历** `.seed/skills/`（项目级）和 `$PLUGIN_ROOT/skills/`（插件内置）下的所有 `.md` 文件，支持任意深度子目录（如 `domain/`、`method/`、`tooling/`）
3. 匹配 YAML frontmatter 中的 `triggers` 关键词
4. 取分数最高的 skill 注入上下文（每 session 最多 5 个，已注入的不重复）

### 内置 Skills


| Skill            | 目录 | 触发词示例                                   | 内容                   |
| ---------------- | ---- | --------------------------------------- | -------------------- |
| `unity-patterns`     | skills/ | rigidbody, physics, animation, prefab   | Unity 引擎开发模式和最佳实践    |
| `lua-scripting`      | skills/ | lua, xlua, hotfix, require, table       | Lua / xLua 热更新脚本开发指南 |
| `ai-pipeline`        | skills/ | mcp, agent, prompt, pipeline, tool_call | AI 工作流和 MCP 集成模式     |
| `mcp-tools`          | skills/ | mcp server, tool, resource, stdio       | MCP 工具开发和调试指南        |
| `detect-tech-stack`  | skills/ | 技术栈检测, 引擎识别, 框架指纹, embed Step 0 | `/seed:embed` Step 0 结构化技术栈指纹检测 |
| `implement`          | skills/method/ | 实现, 开发, feature, coding        | 功能实现方法论             |
| `debug`              | skills/method/ | 调试, bug, crash, error             | 系统化调试方法论             |
| `review`             | skills/method/ | 审查, code review, PR               | 代码审查方法论             |
| `verify`             | skills/method/ | 验证, 测试, test, QA                 | 验证方法论               |
| `config-change`      | skills/method/ | 配置, setting, 参数调整              | 配置变更方法论             |


### 添加项目级 Skill

在 `.seed/skills/` 下创建 `.md` 文件（支持子目录如 `domain/`、`method/`、`tooling/`）：

```markdown
---
name: my-custom-skill
description: 项目特定的知识片段
triggers:
  - keyword1
  - keyword2
---

这里是 skill 正文内容...
```

运行 `/seed:embed` 可自动分析项目技术栈，并生成按矩阵命名的 domain skill 到 `.seed/skills/domain/`。

---

## 路由表

路由表决定了不同任务类型对应的 Agent 组合。默认路由表安装在 `.seed/team-router.md`，可以按项目需求自定义。

### 路由逻辑概览


| task_kind     | 关键路由因素              | 典型组合                              |
| ------------- | ------------------- | --------------------------------- |
| `implement`   | domain + complexity | builder（+ reviewer / unity-pilot） |
| `investigate` | domain + complexity | researcher（+ builder）             |
| `fix`         | 根因已知/未知 + domain    | builder / researcher + builder    |
| `review`      | domain              | reviewer（+ unity-pilot）           |
| `design`      | complexity          | researcher + builder（+ reviewer）  |
| `operate`     | —                   | unity-pilot                       |


### Team 规模建议

- **2 人**（leader + 1）：focused 单域任务
- **3 人**（leader + 2）：module 级或需要验证
- **4 人**（leader + 3）：system 级或 cross-domain
- 超过 4 人 → 先拆分任务再启动

---

## 项目结构

```
seed/
├── .claude-plugin/
│   ├── marketplace.json          # Marketplace 描述符
│   └── plugin.json               # Plugin 描述符
├── assets/
│   └── logo.jpg                  # 项目图标
├── hooks/
│   └── hooks.json                # Hook 注册表（6 类事件，8 条 hook）
├── scripts/
│   ├── run.cjs                   # 统一 Hook 执行器（CJS）
│   ├── plugin-setup.mjs          # 安装后自动执行：保存 Node 路径、patch hooks.json
│   ├── setup-init.mjs            # 首次 session：创建 .seed/ 目录结构
│   ├── setup-claude-md.sh        # 安装/更新 CLAUDE.md 和 seed-reference skill
│   ├── session-start.mjs         # SessionStart：注入 notepad Priority 段 + team 提示
│   ├── project-memory-session.mjs  # SessionStart：注入项目记忆摘要
│   ├── project-memory-posttool.mjs # PostToolUse：更新 hot paths
│   ├── project-memory-precompact.mjs # PreCompact：格式化记忆摘要为 systemMessage
│   ├── skill-injector.mjs        # UserPromptSubmit：匹配并注入 learned skills
│   ├── context-guard-stop.mjs    # Stop：context 使用率监控
│   ├── session-end.mjs           # SessionEnd：写 metrics、清理瞬时状态
│   └── lib/
│       ├── atomic-write.mjs      # 原子写文件工具
│       ├── config-dir.mjs        # Claude 配置目录解析
│       ├── config-dir.sh         # Shell 版配置目录解析
│       ├── memory-formatter.mjs  # 项目记忆格式化工具
│       ├── i18n.mjs              # 国际化工具（语言配置读取 + 本地化字符串）
│       └── stdin.mjs             # 超时保护的 stdin 读取
├── commands/
│   ├── setup.md                  # /seed:setup 命令定义
│   ├── embed.md                  # /seed:embed 命令定义（双轴矩阵分析 + domain skill 生成）
│   └── bud.md                    # /seed:bud 命令定义（通过 /seed 项目快捷命令调用）
├── agents/
│   ├── leader.md                 # 协调者 Agent
│   ├── builder.md                # 实现者 Agent
│   ├── researcher.md             # 调查员 Agent
│   ├── reviewer.md               # 审查员 Agent
│   └── unity-pilot.md            # Unity 操作员 Agent
├── skills/
│   ├── unity-patterns.md         # Unity 开发模式
│   ├── lua-scripting.md          # Lua/xLua 脚本开发
│   ├── ai-pipeline.md            # AI 工作流模式
│   ├── mcp-tools.md              # MCP 工具开发
│   ├── detect-tech-stack.md      # /seed:embed Step 0 技术栈指纹检测规则
│   ├── embed/
│   │   ├── taxonomy-registry.md  # /seed:embed 双轴矩阵单一事实源
│   │   ├── question-bank.md      # Step 2 矩阵补问题库
│   │   ├── skill-catalog.md      # Step 3 矩阵 skill 目录
│   │   ├── builder-catalog.md    # Step 4 builder 生成规则
│   │   ├── researcher-common.md        # researcher 通用物理证据协议与报告结构
│   │   ├── researcher-config.md        # 配置能力 researcher 扫描剧本
│   │   ├── researcher-infra.md         # 基础设施 researcher 扫描剧本
│   │   ├── researcher-lua.md           # Lua researcher 扫描剧本
│   │   ├── researcher-runtime-common.md # 运行时通用 researcher 扫描剧本
│   │   ├── researcher-unity.md         # Unity researcher 扫描剧本
│   │   ├── researcher-godot.md         # Godot researcher 扫描剧本
│   │   ├── researcher-cocos.md         # Cocos researcher 扫描剧本
│   │   ├── researcher-unreal.md        # Unreal researcher 扫描剧本
│   │   └── fixed-questions/            # 分矩阵项拆分的固定调查问题文件
│   │       ├── README.md               # 目录规则与加载顺序说明
│   │       ├── engine/                 # 引擎主线矩阵项（每引擎 13 个方向文件）
│   │       │   ├── unity/              # project-structure, scene-graph-and-lifecycle, script-layer,
│   │       │   ├── godot/              #   bridge-layer, ui-system, animation-system, hot-reload,
│   │       │   ├── cocos/              #   asset-pipeline, event-and-message-system,
│   │       │   └── unreal/             #   physics-navigation-or-runtime-framework,
│   │       │                           #   native-code-architecture, platform-adaptation, plugin-extension
│   │       ├── capability/             # 跨引擎能力矩阵项（5 个 capability）
│   │       │   ├── lua-embedding.md
│   │       │   ├── data-config-pipeline.md
│   │       │   ├── network-protocol-and-sync.md
│   │       │   ├── build-release-and-cicd.md
│   │       │   └── tooling-and-ai-pipeline.md
│   │       └── composite/              # 引擎方向 × capability 交叉叠加问题（第一批高价值预建）
│   │           ├── README.md
│   │           ├── unity/…
│   │           ├── godot/…
│   │           ├── cocos/…
│   │           └── unreal/…
│   ├── method/
│   │   ├── implement.md          # 功能实现方法论
│   │   ├── debug.md              # 系统化调试方法论
│   │   ├── review.md             # 代码审查方法论
│   │   ├── verify.md             # 验证方法论
│   │   └── config-change.md      # 配置变更方法论
│   └── seed-reference/
│       └── SKILL.md              # Seed 参考指南（setup 时安装到 .claude/skills/）
├── templates/
│   ├── config.json               # .seed/config.json 默认模板
│   ├── task.md                   # TaskCreate 元数据模板（11 字段）
│   └── team-router.md            # Agent 路由表模板
├── docs/
│   └── CLAUDE.md                 # 项目 CLAUDE.md 安装源
└── package.json                  # 插件版本描述
```

### 运行时生成（项目目录下）

```
<your-project>/
├── .seed/
│   ├── config.json               # 用户偏好配置
│   ├── project-memory.json       # 项目记忆（长期）
│   ├── notepad.md                # 会话笔记（抗 compact）
│   ├── team-router.md            # 路由表（可项目级定制）
│   ├── state/                    # 运行态状态文件
│   │   └── embed/<stamp>/reports/ # /seed:embed researcher yaml 报告
│   ├── logs/                     # 日志
│   ├── plans/                    # 计划文件
│   └── skills/                   # 项目级 learned skills
│       ├── domain/               # /seed:embed 生成的矩阵化 domain skill（<engine>-* / common-*）
│       ├── method/               # 项目特有工作方法（人工添加）
│       └── tooling/              # 项目特有工具规范（人工添加）
└── .claude/
    ├── CLAUDE.md                 # Seed 核心指令（setup 安装）
    └── commands/
        └── seed.md               # /seed 项目快捷命令（→ /seed:bud 转发）
```

---

## Hook 系统

Seed 通过 Claude Code Hook 机制在 session 生命周期的关键节点注入逻辑：


| 事件                   | 脚本                              | 职责                                |
| -------------------- | ------------------------------- | --------------------------------- |
| `SessionStart(*)`    | `session-start.mjs`             | 注入 notepad Priority 段、team 状态提示   |
| `SessionStart(*)`    | `project-memory-session.mjs`    | 读取并注入项目记忆摘要                       |
| `SessionStart(init)` | `setup-init.mjs`                | 首次初始化 `.seed/` 目录结构               |
| `UserPromptSubmit`   | `skill-injector.mjs`            | 扫描 prompt 匹配 triggers，注入 skill 片段 |
| `PostToolUse`        | `project-memory-posttool.mjs`   | Write/Edit 后更新记忆 hot paths        |
| `PreCompact`         | `project-memory-precompact.mjs` | Compact 前格式化记忆摘要为 systemMessage   |
| `Stop`               | `context-guard-stop.mjs`        | Context 使用率 > 75% 时提醒 /compact    |
| `SessionEnd`         | `session-end.mjs`               | 写入 session metrics，清理瞬时状态         |


所有 hook 脚本均为 ESM（`.mjs`），通过统一的 `run.cjs`（CJS）执行器调用，无外部依赖。

---

## 配置

配置文件位于 `.seed/config.json`，首次 setup 时从模板生成：

```json
{
  "language": "",
  "bud": {
    "mode": "auto"
  },
  "embed": {
    "parallelism": {
      "maxResearchersPerWave": 4,
      "maxBuildersPerWave": 4,
      "waveTimeoutSeconds": 600
    }
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


| 配置项                           | 说明                     | 默认值       |
| ----------------------------- | ---------------------- | --------- |
| `language`                    | 交互语言（影响所有输出和注释）        | setup 时选择 |
| `bud.mode`                    | 默认执行模式                 | `auto`    |
| `embed.parallelism.maxResearchersPerWave` | 单 wave 最多并发 researcher 数 | `4`       |
| `embed.parallelism.maxBuildersPerWave` | 单 wave 最多并发 builder 数 | `4`       |
| `embed.parallelism.waveTimeoutSeconds` | 单 wave 超时（秒） | `600`     |
| `memory.autoLearn`            | 自动学习项目知识               | `true`    |
| `memory.rescanIntervalHours`  | 记忆重扫间隔（小时）             | `24`      |
| `contextGuard.threshold`      | Context 使用率告警阈值（%）     | `75`      |
| `contextGuard.maxBlocks`      | 最大 block 次数            | `2`       |
| `skillInjector.maxPerSession` | 每 session 最多注入 skill 数 | `5`       |


---

## 当前范围

Seed 目前专注于以下使用场景：

- 通过 Claude Code Plugin 机制安装和运行
- 使用 Claude Code 原生 Agent Team 进行多 Agent 协作
- 针对游戏研发领域（Unity / Godot / Unreal / Cocos 主线 + 跨引擎能力矩阵）的工作流优化

以下能力暂未纳入，后续可能根据需求扩展：

- npm 全局安装方式
- tmux / CLI 终端编排模式
- Codex / Gemini 等其他 AI backend 接入
- HUD / analytics / session learner 等监控功能
- ralph / autopilot / ultrawork 等持续执行模式
- MCP Server（预留接口，待知识引擎就绪后接入）
---

## License

MIT

## 🥚 彩蛋：关于名字

Seed 的名字来自《刀剑神域》（Sword Art Online）中的 **The Seed** ——一个可以复刻完整虚拟世界的程序包，创造无数游戏世界的起点。

把 Seed 种进你的游戏项目，它就会在代码库里生根发芽：它会**记住你的技术栈**，**沉淀项目的专属记忆**，并在每一次你需要的时候，**召唤出最契合的 Agent 组合**与你并肩作战。

不做一个庞大笨重的框架，而是作为一个轻量却充满无限可能的起点。
命令也因此很简单，就叫 `/seed`。
