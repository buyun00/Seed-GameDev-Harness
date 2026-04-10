---
name: bud
description: 分析任务并组装 agent team 执行
---

# /seed:bud

你是 Seed 的 bud 引擎。你的工作是分析用户的自然语言任务描述，从路由表中选择合适的 agent 组合，并启动一个 CC 原生 agent team。

**语言**：读取 `.seed/config.json` → `language`。所有面向用户的输出（问题、方案摘要、状态消息、任务描述）必须使用配置的语言。以下模板是示例；请根据配置的语言进行适配。

## 执行保障（必须遵守）

- 如果当前环境**不支持** `AskUserQuestion`，或按钮/表单式交互没有成功弹出，**必须立即降级为普通文本提问**，并明确告诉用户该如何回复。
- “静默分析”只是中间步骤，不是结束条件。完成步骤 1 和步骤 2 后，必须继续进入步骤 3 展示方案，或在 `auto` 模式下继续进入步骤 4 并向用户报告结果。
- 如果当前环境无法使用 `TeamCreate` / `TaskCreate` / `SendMessage`，必须明确告知用户当前会话尚未具备 Team 能力，并提示检查 `/seed:setup` 是否已完成以及 Claude Code 是否已经重启。**不要**静默结束，也**不要**假装 team 已启动。
- 每到一个需要用户输入的节点，都要明确写出“你现在需要回复什么”。

## 前置检查：配置意图拦截

在执行任何步骤之前，检查 `{{ARGUMENTS}}` 是否包含以下任意关键词（不区分大小写）：

`配置` · `config` · `设置` · `setup` · `改一下` · `修改配置` · `change setting` · `重新设置` · `初始化`

如果匹配，**不要继续执行**，直接告诉用户：

```
这看起来是一个 Seed 配置请求。请运行：

  /seed:setup

/seed:setup 可以修改语言、bud 模式、Agent Teams 等设置。
```

然后**停止**，不继续后续步骤。

## 步骤 0：解析模式和任务描述

从 `{{ARGUMENTS}}` 中提取：

**标志**（可选，以 `--` 开头的第一个 token）：
- `--auto` → mode = auto
- `--confirm` → mode = confirm
- `--guided` → mode = guided

**任务描述**：标志之后的所有内容（如果没有标志则为整个参数）。

**模式优先级**（从高到低）：
1. 参数中的标志
2. `.seed/config.json` → `bud.mode`
3. 如果都不存在，使用 `AskUserQuestion` 询问用户选择：
   - **auto** — 分析后直接启动，无需确认
   - **confirm** — 展示方案，一次确认后启动（推荐）
   - **guided** — 逐步引导，可调整每个参数

   将用户的选择写入 `.seed/config.json` 的 `bud.mode`，这样下次不会再次询问。

   如果 `AskUserQuestion` 不可用，改为普通文本，并要求用户直接回复 `auto` / `confirm` / `guided`。

如果任务描述为空，使用 `AskUserQuestion` 询问："团队应该处理什么任务？"

如果 `AskUserQuestion` 不可用，改为普通文本直接询问。

## 步骤 1：任务分析（静默执行 — 不要展示给用户）

分析任务描述并确定三个维度：

### task_kind（选其一）：
| 类型 | 何时使用 |
|------|---------|
| `implement` | 构建新功能、添加新代码 |
| `investigate` | 研究、探索、"为什么 X 会发生" |
| `fix` | Bug 修复、错误解决、"X 坏了" |
| `review` | 代码审查、架构审查、PR 审查 |
| `design` | 系统设计、架构规划、API 设计 |
| `operate` | Unity Editor 操作、场景编辑、Play Mode 测试 |

### domain（选其一）：
| 领域 | 描述中的信号 |
|------|------------|
| `unity-runtime` | C#、MonoBehaviour、Rigidbody、Collider、Scene、Prefab、Inspector、Play Mode、物理、动画 |
| `lua-gameplay` | Lua、xlua、hotfix、table、require、用 Lua 编写的游戏逻辑 |
| `ai-pipeline` | MCP、agent、prompt、workflow、pipeline、model、tool_call |
| `architecture` | 系统设计、模块结构、API 设计、重构、依赖 |
| `cross-domain` | 涉及以上多个领域，或无法确定单一领域 |

### complexity（选其一）：
| 级别 | 描述 |
|------|------|
| `focused` | 单文件或单函数，范围明确的变更 |
| `module` | 一个模块/系统中的多个文件 |
| `system` | 跨模块，有架构影响 |

### fix 专项：根因状态
当 `task_kind` = `fix` 时，判断根因是否已知：
- **已知**：描述中包含具体的文件路径、函数名、变量名、带堆栈跟踪的错误消息 → 用户已经知道 bug 在哪里。
- **未知**：描述中只有症状（"跳跃感觉飘"、"帧率下降"、"偶尔崩溃"） → 需要先调查。

## 步骤 2：路由到 agent 组合

从 `.seed/team-router.md`（在项目的 `.seed/` 目录下）读取路由表。如果不存在，回退到 `$CLAUDE_PLUGIN_ROOT/templates/team-router.md`。

解析 markdown 表格，根据 `task_kind`、`domain`、`complexity` 以及（对于 fix）根因状态找到匹配的 agent 组合。

路由表会给你：
- 包含哪些 agent（除了始终存在的 leader）
- 团队规模建议

**Leader 始终包含在内** — 不需要从路由表中列出；它是隐含的。

## 步骤 3：根据模式展示方案

### auto 模式
完全跳过确认。直接进入步骤 4。

### confirm 模式
以以下格式展示方案：

```
准备启动 Seed team

任务：{任务描述}
性质：{task_kind}  领域：{domain}  复杂度：{complexity}

组装方案：
  leader        协调 + 方向仲裁（常驻）
  {agent}       {角色描述}
  {agent}       {角色描述}
  ...

任务拆解：
  1. {任务描述}  →  {负责角色}
  2. {任务描述}  →  {负责角色}（依赖 1）
  ...
```

然后使用 `AskUserQuestion` 询问："确认启动？（是 / 否 / 调整）"

如果 `AskUserQuestion` 不可用，改为普通文本，并要求用户直接回复 `是` / `否` / `调整`。

- **是** → 进入步骤 4
- **否** → 中止，告诉用户可以用不同参数重新运行
- **调整** → 切换到 guided 模式的调整流程（见下方）

### guided 模式
展示与 confirm 模式相同的方案，然后逐一引导每个可调参数：

1. **任务描述** — "是否要修改任务描述？"（展示当前值，让用户编辑或跳过）
2. **task_kind** — "当前：{kind}。是否更改？"（展示选项：implement / investigate / fix / review / design / operate）
3. **domain** — "当前：{domain}。是否更改？"（展示选项：unity-runtime / lua-gameplay / ai-pipeline / architecture / cross-domain）
4. **complexity** — "当前：{complexity}。是否更改？"（展示选项：focused / module / system）
5. **根因状态**（仅当 task_kind = fix 时展示） — "根因是已知还是未知？"（known / unknown）。如果用户将 task_kind 改为非 fix，跳过此步。
6. **Agent 组合** — "当前 agents：{列表}。是否要添加/移除？"选项：
   - 添加 reviewer（强制代码审查）
   - 添加 researcher（强制调查阶段）
   - 添加 unity-pilot（强制 Editor 验证）
   - 移除特定 agent
7. **任务拆解** — "当前任务：{列表}。是否要修改、添加或删除任务？"

所有调整完成后（如果 task_kind/domain/complexity/根因状态有变更则重新路由），展示最终方案并请求确认。

## 步骤 4：启动 CC 原生 team

按顺序执行以下 CC 原生工具调用：

### CC 原生 SendMessage / 关闭协议

- 普通文本消息必须传 `summary`，即 `SendMessage({ "to": "leader", "message": "...", "summary": "短预览" })`
- 不要只传 `to` + 字符串 `message`，否则会触发 `summary is required when message is a string`
- 关闭 teammate 时必须使用结构化消息：`SendMessage({ "to": "{teammate}", "message": { "type": "shutdown_request", "reason": "..." } })`
- teammate 必须用结构化 `shutdown_response` 批准或拒绝；批准后才视为该 teammate 已关闭
- 所有 teammate 关闭后再调用 `TeamDelete`；`TeamDelete` 不接收 `team_name`、`message` 或最终摘要，最终摘要在删除成功后直接输出给用户

### 4.1 生成 team slug
从任务描述创建 slug：取 3-4 个关键词，用 `-` 连接，全小写英文。示例：
- "实现跳跃手感优化" → `jump-feel-optimization`
- "调查帧率下降问题" → `investigate-framerate-drop`
- "Review the new combat system" → `review-combat-system`

### 4.2 创建 team
```
TeamCreate("{slug}")
```

### 4.3 创建任务
对于拆解中的每个任务，调用 `TaskCreate`，描述遵循 `templates/task.md` 格式（10 个字段 — 在设计文档的 8 字段架构基础上增加了 Scope Coverage 和 Exclusions 以更好地界定任务范围）：

```
Task Kind: {implement | investigate | review | verify | closeout}
Expected Owner Role: {leader | builder | researcher | reviewer | unity-pilot}
Deliverable: {具体交付物描述}
Done Definition: {明确的完成标准}
Dependencies: {逗号分隔的任务 ID，或 "none"}
Risk Level: {low | medium | high}
Leader Ack Required: {true | false}
Original User Intent: {用户的原始任务描述}
Scope Coverage: {此任务覆盖的内容}
Exclusions: {此任务明确不覆盖的内容}
```

任务创建指南：
- 第一个任务通常是主要工作项（implement/investigate/fix）
- 如果有 researcher 参与，调查任务排在前面，实现任务依赖它
- 如果有 reviewer 参与，审查任务依赖实现任务
- 如果有 unity-pilot 参与，验证任务依赖实现任务
- 始终包含一个分配给 leader 的 `closeout` 任务作为最终任务，设置 `Leader Ack Required: true`
- 涉及核心系统、物理或跨模块边界的任务设置 `Risk Level: high`

### 4.4 向 leader 发送启动消息
```
SendMessage → leader
```

发送给 leader 的消息应包含：

```
# Seed Team 启动

## 目标
{用户的任务描述}

## 分析
- 任务类型: {task_kind}
- 领域: {domain}
- 复杂度: {complexity}

## 团队组成
{agent 列表及其角色}

## 任务板
{带有负责人和依赖关系的编号任务列表}

## 指令
1. 审查任务板并确认分配
2. 通过 SendMessage 与队友协调
3. 对于任何方向争议或歧义，由你做最终决定
4. 当所有任务完成后，验证每个完成定义并关闭团队

## 升级规则
队友必须升级给你（不得自行决定）的情况：
- 存在多个可行的实现方案
- 依赖关系变化影响其他任务
- 出现 Risk Level = high 的情况
- 任何"要不要改这个"的不确定性
```

### 4.5 向用户报告
启动后，告诉用户：

```
Seed team 已启动: {slug}

  团队: leader + {agent 列表}
  任务: 已创建 {count} 个任务

使用 /team status 查看进度。
Leader 将协调团队并在完成时关闭。
```

## 任务分解指南

### implement 任务
- focused 复杂度：单个 `implement` 任务
- module 复杂度：拆分为 `implement` + `verify`
- system 复杂度：拆分为 `implement`（每个子系统）+ `review` + `verify`

### investigate 任务
- `investigate` → `implement`（如需修复）→ `verify`
- researcher 负责调查，builder 负责实现

### fix 任务（根因已知）
- `implement`（修复）→ `verify`

### fix 任务（根因未知）
- `investigate`（定位根因）→ `implement`（修复）→ `verify`

### review 任务
- `review`（reviewer 检查代码）→ leader closeout

### design 任务
- `investigate`（研究约束）→ `implement`（编写设计文档/原型）→ `review`

### operate 任务
- `operate`（unity-pilot 执行工作）→ leader closeout
