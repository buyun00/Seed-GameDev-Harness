# Researcher Spec Builder — 自动化调查规格生成系统

## 概述

本系统是 GameDev-AI-Harness 框架中的 **researcher 调查规格自动生成流水线**。

当 builder agent 遇到需要深入调查的代码问题时（如绑定链路追踪、UI 归属定位、规范核对等），本系统可根据 builder 的自然语言问题描述，自动组装一份完整的 researcher agent 提示词（researcher spec），使 researcher 能够带着精确的任务契约、调查方法、交付标准和已知线索去执行定向调查。

**核心设计原则：LLM 不直接编辑工作文件。** 所有内容写入均通过脚本完成（写临时文件 → 脚本字符串替换 → 删除临时文件），保证工作文件内容的可控性和一致性。

---

## 部署位置

| 本地开发目录 | 实际部署位置 |
|---|---|
| `d:\__Work\GameDev-AI-Harness\skill\` | 项目根目录 `.claude/` |

本地目录用于轻量构建和测试，所有路径和脚本设计均按 `.claude/` 下运行为准。部署时将本目录内容整体复制到 `.claude/` 即可。

---

## 目录结构

```
.claude/
├── doc/
│   └── researcher.md          # researcher spec 模板（含占位符）
├── mf/                         # Method Fragment 库
│   ├── MF-UI类.md
│   ├── MF-绑定类.md
│   ├── MF-数据流类.md
│   ├── MF-渲染类.md
│   └── MF-规范类.md
├── tools/                      # Tool Skill 库
│   ├── TOOL-UI归属定位.md
│   ├── TOOL-绑定链路追踪.md
│   ├── TOOL-代码配置文档交叉验证.md
│   ├── TOOL-数据流追踪.md
│   ├── TOOL-网络层追踪.md
│   ├── TOOL-渲染结构分析.md
│   ├── TOOL-性能数据采集.md
│   ├── TOOL-规范文档与样本查阅.md
│   └── TOOL-项目记忆查询.md
├── skills/                     # Skill 定义
│   ├── researcher-spec-builder/
│   │   └── SKILL.md            # 主流水线 skill（阶段三编排）
│   ├── current-task-contract-creator/
│   │   └── SKILL.md            # Current Task Contract 生成器
│   ├── delivery-contract-creator/
│   │   └── SKILL.md            # Delivery Contract 生成器
│   └── domain-context-creator/
│       └── SKILL.md            # Domain Context 收集器
├── scripts/                    # 纯脚本工具（Node.js，无外部依赖）
│   ├── copy-template.js        # 阶段一：复制模板
│   ├── list-options.js         # 阶段二：列出可选 MF / Tool Skills
│   ├── fill-options.js         # 阶段二：将选中项写入工作文件
│   └── inject-section.js       # 阶段三：将 LLM 输出注入工作文件
└── output/                     # 工作文件输出目录（运行时生成）
    └── researcher-YYYYMMDD-HHMM.md
```

---

## 模板结构

模板文件 `doc/researcher.md` 定义了 researcher spec 的骨架：

```markdown
---
name: researcher
description: 调查代码
tools: Read, Glob, Grep
model: sonnet
color: cyan
---

# Researcher Core
（固定内容：researcher 的角色定义和基本原则）

# Current Task Contract
{task_contract}

# Delivery Contract
{delivery_contract}

# Method Fragments
{selected_method_fragments}

# Required Tool Skills
{selected_tool_skills}

# Domain Context
{domain_context}
```

五个占位符 `{...}` 在流水线各阶段被逐一替换为实际内容。

---

## 流水线三阶段

### 阶段一：模板复制（纯脚本，无 LLM）

```bash
# 在 .claude/ 目录下运行
node scripts/copy-template.js --output output/
```

- 读取 `doc/researcher.md`
- 复制为 `output/researcher-[YYYYMMDD-HHMM].md`（带时间戳的工作文件）
- 输出工作文件路径到 stdout

### 阶段二：选择填充（脚本列出 → LLM 判断 → 脚本写入）

MF 和 Tool Skills 的选择遵循同一模式：

**Step 1 — MF 选择：**

```bash
node scripts/list-options.js --type mf
# 输出：MF-UI类 | 界面/按钮/节点/面板等 UI 相关问题
#       MF-绑定类 | 点击绑定/事件注册/消息监听/回调挂接...
#       ...
```

LLM 根据 builder 的问题描述选择 MF ID（可多选，第一个为主 MF）：

```bash
node scripts/fill-options.js --file output/researcher-xxx.md --type mf --ids MF-绑定类,MF-UI类
# ✓ 已写入 {selected_method_fragments}（2 项：MF-绑定类, MF-UI类）
```

**Step 2 — Tool Skills 选择：**

```bash
node scripts/list-options.js --type skill
# 输出：TOOL-UI归属定位 | 确认目标 UI 节点归属界面/控制类...
#       TOOL-绑定链路追踪 | 确认目标节点主绑定入口...
#       ...
```

LLM 根据问题描述 + 已选 MF 判断需要哪些 Tool Skills：

```bash
node scripts/fill-options.js --file output/researcher-xxx.md --type skill --ids TOOL-绑定链路追踪,TOOL-UI归属定位,...
# ✓ 已写入 {selected_tool_skills}（N 项：...）
```

### 阶段三：LLM 填充（skill 编排）

由 `skills/researcher-spec-builder` 编排，依次调用三个子 skill 完成剩余三个占位符的填充。

**执行流程（6 步，严格顺序）：**

| Step | 动作 | 占位符 | 是否需要人交互 |
|---|---|---|---|
| 1 | 验证工作文件状态 | — | ❌ |
| 2 | 调用 `current-task-contract-creator` | `{task_contract}` | ⚠️ 可能追问 builder 澄清对象 |
| 3 | 调用 `delivery-contract-creator` | `{delivery_contract}` | ❌ 纯提取 + 组装 |
| 4 | 调用 `domain-context-creator` | `{domain_context}` | ✅ 向 builder 问答收集已知线索 |
| 5 | 完整性验证 | — | ❌ |
| 6 | 生成证据索引 | 追加 `# Evidence Index` | ❌ |

---

## 子 Skill 说明

### current-task-contract-creator — Current Task Contract 生成器

**职责：** 从 builder 的自然语言描述中提炼一份结构化的任务契约。

**核心字段：**
- 当前问题（调查什么）
- 为什么查（动作价值）
- 为谁查（默认 builder）
- 任务意图（正向目标 + 负向边界）
- 完成条件（可验收标准）
- 输出边界约束（防跑偏）

**工作模式：**
- **Mode A — Need Clarification：** 当调查对象存在歧义时，最小追问（每轮最多 1~2 个问题）
- **Mode B — Ready To Render：** 信息足够时，直接输出正式 CTC

**回写方式：** 输出 → 写入 `output/.section-temp.md` → `inject-section.js --placeholder {task_contract}` → 删除临时文件

### delivery-contract-creator — Delivery Contract 生成器

**职责：** 从已填入的 CTC 和 MF 中提取信息，组装 researcher 的交付标准。

**提取规则：**
- 从 CTC 完成条件 → Section 1 结论维度
- 从 CTC 为什么查 + 任务意图 → Section 6 必填建议条目
- 从 MF 的 DC Contribution 块 → Section 2 输出格式、Section 4 检查矩阵维度
- 默认值兜底（无 DC Contribution 时使用通用格式）

**输出结构（固定 7 个 Section）：**
1. 当前结论
2. 主结构（由 MF 声明格式）
3. 关键证据
4. 检查矩阵（由 MF 声明维度）
5. 未确认点
6. 给 Builder 的建议
7. 额外发现

**无需人交互，完全自动。**

### domain-context-creator — Domain Context 收集器

**职责：** 向 builder 收集已有的项目知识，整理为 researcher 可直接利用的线索列表。

**工作流程：**
1. 读取已选 MF 的"常见误判/漏项"，转化为"你知道吗"式定向问题
2. 向 builder 提问（明确说明不知道的直接跳过）
3. 过滤整理：保留具体事实，排除泛化信息，不确定项加注

**重要边界：** 只收集 builder 已有知识，不要求 builder 去查新东西。

---

## 脚本说明

所有脚本使用 Node.js 编写，零外部依赖，依赖 Claude Code 插件内置 Node.js 运行。

### copy-template.js

```
node scripts/copy-template.js [--output output/]
```
复制 `doc/researcher.md` 为带时间戳的工作文件。输出文件路径到 stdout。

### list-options.js

```
node scripts/list-options.js --type mf|skill
```
枚举 `mf/` 或 `tools/` 目录下所有 `.md` 文件，输出 `ID | 描述`。描述优先从 frontmatter `description` 字段读取，其次取正文第一行。

### fill-options.js

```
node scripts/fill-options.js --file [工作文件] --type mf|skill --ids [id1,id2,...]
```
读取指定 ID 对应的文件内容（自动剥离 frontmatter），按顺序拼接后替换工作文件中的对应占位符：
- `--type mf` → 替换 `{selected_method_fragments}`，MF 之间插入分隔线
- `--type skill` → 替换 `{selected_tool_skills}`，换行分隔

### inject-section.js

```
node scripts/inject-section.js --file [工作文件] --placeholder [占位符] --from [临时文件]
```
读取临时文件内容，替换工作文件中的指定占位符，完成后自动删除临时文件。这是子 skill 写回工作文件的统一通道。

---

## Method Fragment（MF）与 Tool Skill

### Method Fragment

MF 定义了 researcher 针对某类问题的 **调查方法论**——调查视角、推进方向、必查维度、停止条件、常见误判。

当前可用 MF：

| ID | 适用场景 |
|---|---|
| MF-UI类 | 界面、按钮、节点、面板、显示状态、交互行为 |
| MF-绑定类 | 点击绑定、事件注册、消息监听、回调挂接、配置驱动接线 |
| MF-数据流类 | 数据流向、状态管理、数据同步 |
| MF-渲染类 | 渲染管线、材质、Shader、显示效果 |
| MF-规范类 | 命名约定、目录组织、接入方式、框架推荐模式 |

MF 可多选组合，第一个为主 MF。

### Tool Skill

Tool Skill 定义了 researcher 在调查中可使用的 **通用能力**（搜索策略声明，不是可执行工具）。

当前可用 Tool Skills：

| ID | 用途 |
|---|---|
| TOOL-UI归属定位 | 确认目标 UI 节点的界面归属、控制类、生命周期入口 |
| TOOL-绑定链路追踪 | 确认主绑定入口、事件注册方式、回调中转与业务落点 |
| TOOL-代码配置文档交叉验证 | 确认行为是否受配置、规范或外层框架影响 |
| TOOL-数据流追踪 | 追踪数据流向与状态变更链路 |
| TOOL-网络层追踪 | 追踪网络请求、协议、收发链路 |
| TOOL-渲染结构分析 | 分析渲染管线、材质、Shader 结构 |
| TOOL-性能数据采集 | 采集与分析性能相关数据 |
| TOOL-规范文档与样本查阅 | 查阅项目规范、约定和同类实现样本 |
| TOOL-项目记忆查询 | 查询已有的调查 memo 和项目记忆 |

---

## 证据索引（Evidence Index）

流水线最后一步会从完成的调查报告中提取所有代码引用点，以机器可读格式追加到文件末尾：

```
# Evidence Index

wanfaViewUI.lua | WanfaViewUI:createItemNode | 154-197
systemHunt.lua | SystemHunt:openView | 8-13
huntTeamDialog.lua | HuntTeamDialog:onClickDispatch | 255-272
...
```

格式：`文件名 | 函数名 | 行号或行号范围`

用途：后续知识库系统可通过脚本解析此索引，对比 git 记录检测调查结论是否过期。

---

## 完整调用示例

以下展示一次完整的 researcher spec 生成过程：

```
# 阶段一：复制模板
$ node scripts/copy-template.js --output output/
output/researcher-20260413-0056.md

# 阶段二：选择 MF
$ node scripts/list-options.js --type mf
MF-UI类 | 界面/按钮/节点/面板等 UI 相关问题
MF-绑定类 | 点击绑定/事件注册/消息监听/回调挂接...
...

# LLM 判断后选择：MF-绑定类, MF-UI类
$ node scripts/fill-options.js --file output/researcher-20260413-0056.md --type mf --ids MF-绑定类,MF-UI类
✓ 已写入 {selected_method_fragments}（2 项：MF-绑定类, MF-UI类）

# 阶段二：选择 Tool Skills
$ node scripts/list-options.js --type skill
TOOL-UI归属定位 | ...
TOOL-绑定链路追踪 | ...
...

# LLM 判断后选择
$ node scripts/fill-options.js --file output/researcher-20260413-0056.md --type skill --ids TOOL-绑定链路追踪,TOOL-UI归属定位,...
✓ 已写入 {selected_tool_skills}（4 项：...）

# 阶段三：启动 researcher-spec-builder skill
# → Step 1: 验证文件状态
# → Step 2: current-task-contract-creator 生成任务契约（可能追问 builder）
# → Step 3: delivery-contract-creator 生成交付契约
# → Step 4: domain-context-creator 收集 builder 已知线索
# → Step 5: 完整性验证
# → Step 6: 生成证据索引
✓ researcher spec 已完成，可直接交给 researcher 执行。
```

---

## 扩展 MF / Tool Skill

### 添加新 Method Fragment

在 `mf/` 目录下创建 `MF-[类别名].md`，格式：

```markdown
---
id: MF-[类别名]
description: 一行描述（用于 list-options.js 展示）
---

## Method Fragment: [类别名]问题调查

适用于：
...

默认调查视角：
...

默认推进方向：
...

必查维度：
...

常见误判 / 常见漏项：
...

停止条件：
...
```

### 添加新 Tool Skill

在 `tools/` 目录下创建 `TOOL-[能力名].md`，格式：

```markdown
---
id: TOOL-[能力名]
description: 一行描述（用于 list-options.js 展示）
---

## [能力名]

用于...（一段话说明该能力的使用场景和目标）
```

新增文件会被 `list-options.js` 自动发现，无需修改任何脚本或 skill 定义。

---

## 规划中的功能

### 三级搜索强度体系

当前的 researcher spec 生成流水线属于 **L3（完整调查）**，适用于跨系统、多维度的复杂问题。规划中将引入分级搜索机制：

| 级别 | 方式 | 耗时 | 场景 |
|---|---|---|---|
| L1 | Builder 直接用 Read/Grep/Glob 搜索 | 秒级 | 目标在已知目录，只需读代码 |
| L2 | 查询知识库（已有调查 memo） | 秒~十秒级 | 需要结论而非代码位置，且之前调查过 |
| L3 | 完整 researcher spec 生成 + researcher 执行 | 分钟级 | 全新的跨系统复杂问题 |

### 知识库与过期检测

- L3 调查完成后，结论沉淀为标准化 memo 存入知识库
- 证据索引（Evidence Index）支持脚本化 git 过期检测
- L2 查询命中过期 memo 时，触发定向更新而非完整重查
