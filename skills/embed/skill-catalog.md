---
name: embed-skill-catalog
description: /seed:embed Step 3 双轴矩阵 skill 生成目录
triggers:
  - embed step3
  - skill catalog
  - matrix skill catalog
domain:
  - project-analysis
scope:
  - agent-inject
---

# /seed:embed Step 3 Skill Catalog

本文件负责根据 `tech_stack_report` 生成目标 skill 文件列表。执行前必须先加载 [`$CLAUDE_PLUGIN_ROOT/skills/embed/taxonomy-registry.md`]($CLAUDE_PLUGIN_ROOT/skills/embed/taxonomy-registry.md)。

## Step 3 目标

Step 3 不再维护一张手写静态文件表，而是基于 registry 动态展开：

- 当前主引擎的 13 个 `directions`
- 当前项目已激活的 `capabilities`

## 生成规则

### 0. 输入前置条件

进入 Step 3 前，`tech_stack_report` 必须已经完成用户补全状态归一化。Step 3 不允许只读取 Step 0 的原始扫描状态。

已由用户在 Step 1 / Step 2 补全或确认的矩阵项必须写回对应项：

- `confirmed_by_user: true`
- `user_supplied_evidence: "<用户补充内容>"`（如有）
- `status` 已从原始 `missing` 归一化为：
  - `detected`：用户补充了路径、目录、文件名、类名、函数名、配置项或关键字符串
  - `unknown`：用户只补充了方案名称或自然语言描述，但没有具体落点
  - `missing`：用户明确确认该方向不存在或不使用该能力

如果 Step 3 发现 `confirmed_by_user: true` 且用户并未确认不存在的项仍为 `missing`，这是流程错误，必须回到 Step 1 / Step 2 的归一化逻辑修正，禁止静默跳过。

### 1. 引擎主线 skill

对当前 `engine.name` 的 13 个方向逐一判断：

- `status = detected`
  - 生成对应 skill
- `status = unknown`
  - 生成对应 skill，但后续 builder 可能落为占位 skill
- `status = missing`
  - 仅当用户未补全 / 未确认，或用户明确确认该方向不存在时不生成
  - 如果 `confirmed_by_user: true` 且用户并未确认不存在，不得不生成；必须先修正为 `detected` 或 `unknown`
- `status = unsupported`
  - 不生成

命名规则：

- 文件：`domain/<engine>-<direction-kebab>.md`
- `matrix_id`: `engine.<engine>.<direction_id>`
- `question_set_id`: `qs-<engine>-<direction-kebab>`
- `fixed_question_file`: `$CLAUDE_PLUGIN_ROOT/skills/embed/fixed-questions/engine/<engine>/<direction-kebab>.md`

### 2. 跨引擎能力 skill

对 5 个 capability 逐一判断：

- `status = detected`
  - 生成对应 skill
- `status = unknown`
  - 如果已经进入 `active_capabilities`，或 `confirmed_by_user: true`，生成对应 skill，但允许 builder 写成占位 skill
- `status = missing`
  - 仅当用户未补全 / 未确认，或用户明确确认该能力不存在时不生成
  - 如果 `confirmed_by_user: true` 且用户并未确认不存在，不得不生成；必须先修正为 `detected` 或 `unknown`
- `status = unsupported`
  - 不生成

命名规则：

- 文件：`domain/common-<capability-kebab>.md`
- `matrix_id`: `capability.<capability_id>`
- `question_set_id`: `qs-common-<capability-kebab>`
- `fixed_question_file`: `$CLAUDE_PLUGIN_ROOT/skills/embed/fixed-questions/capability/<capability-kebab>.md`

### 3. 不再生成的旧文件类型

以下旧命名和旧分类不再作为 v2 catalog 输出：

- `domain/project-structure.md`
- `domain/project-conventions.md`
- `godot_extra`
- `unreal_extra`
- `cocos_extra`

它们统一被新的引擎矩阵文件或 `common-*` 文件替代。

## V2 文件模式

### Engine 文件模式

| direction_id | 输出文件模式 | 作用说明 |
|---|---|---|
| `project_structure` | `domain/<engine>-project-structure.md` | 当前引擎在目录结构、模块划分和工程边界上的约定 |
| `scene_graph_and_lifecycle` | `domain/<engine>-scene-graph-and-lifecycle.md` | 当前引擎的场景、节点/对象图和生命周期主路径 |
| `native_code_architecture` | `domain/<engine>-native-code-architecture.md` | 当前引擎原生代码层的架构、C# / C++ / TS 等宿主语言编码约定、异步与分层 |
| `script_layer` | `domain/<engine>-script-layer.md` | 当前引擎脚本层的组织方式、Lua / GDScript / Blueprint / TS 等业务脚本约定与职责边界 |
| `bridge_layer` | `domain/<engine>-bridge-layer.md` | 当前引擎与脚本层、插件或宿主之间的桥接边界 |
| `ui_system` | `domain/<engine>-ui-system.md` | 当前引擎 UI 栈、界面组织和交互主路径 |
| `hot_reload` | `domain/<engine>-hot-reload.md` | 当前引擎热更新/热重载方案及限制 |
| `asset_pipeline` | `domain/<engine>-asset-pipeline.md` | 当前引擎资源组织、加载、释放和打包主路径 |
| `event_and_message_system` | `domain/<engine>-event-and-message-system.md` | 当前引擎的事件、消息与系统通信方式 |
| `animation_system` | `domain/<engine>-animation-system.md` | 当前引擎动画栈与项目动画组织约定 |
| `physics_navigation_or_runtime_framework` | `domain/<engine>-physics-navigation-or-runtime-framework.md` | 当前引擎物理、导航或 runtime framework 的项目约定 |
| `plugin_extension` | `domain/<engine>-plugin-extension.md` | 当前引擎插件、扩展和外部模块接入方式 |
| `platform_adaptation` | `domain/<engine>-platform-adaptation.md` | 当前引擎平台适配、导出目标和平台桥接约定 |

### Capability 文件模式

| capability_id | 输出文件 | 作用说明 |
|---|---|---|
| `lua_embedding` | `domain/common-lua-embedding.md` | Lua runtime、桥接、绑定生成、热修和双向互调约定；不替代 `script_layer` 中的 Lua 业务脚本组织约定 |
| `data_config_pipeline` | `domain/common-data-config-pipeline.md` | 配置表、Schema、导表、校验与运行时消费链路 |
| `network_protocol_and_sync` | `domain/common-network-protocol-and-sync.md` | 网络协议、传输层、同步框架和异常处理约定 |
| `build_release_and_cicd` | `domain/common-build-release-and-cicd.md` | 构建、发布、热更产物生成和 CI/CD 流水线约定 |
| `tooling_and_ai_pipeline` | `domain/common-tooling-and-ai-pipeline.md` | MCP、Agent、工具链、自动化和 AI workflow 约定 |

## Builder frontmatter 契约

所有生成的 skill 必须至少包含以下 frontmatter：

### Engine skill

```yaml
---
name: unity-project-structure
description: 当前项目在 Unity / project_structure 方向的约定
triggers:
  - unity project structure
  - unity directory layout
domain:
  - project-domain
scope:
  - runtime
matrix_id: engine.unity.project_structure
axis: engine
engine: unity
direction_id: project_structure
question_set_id: qs-unity-project-structure
fixed_question_file: $CLAUDE_PLUGIN_ROOT/skills/embed/fixed-questions/engine/unity/project-structure.md
source: scanned | user-confirmed | incomplete
---
```

### Capability skill

```yaml
---
name: common-lua-embedding
description: 当前项目的 Lua 跨引擎嵌入约定
triggers:
  - lua embedding
  - lua bridge
domain:
  - project-domain
scope:
  - runtime
matrix_id: capability.lua_embedding
axis: capability
capability: lua_embedding
capability_id: lua_embedding
question_set_id: qs-common-lua-embedding
fixed_question_file: $CLAUDE_PLUGIN_ROOT/skills/embed/fixed-questions/capability/lua-embedding.md
source: scanned | user-confirmed | incomplete
---
```

## 正文结构契约

每个 skill 的正文至少包含以下段落：

1. `## 结论`
   - 写项目里真实命中的实现和入口
2. `## 证据`
   - 列路径、命中串、调用落点；如果来自用户补全，列 `user_supplied_evidence`
3. `## 使用约定`
   - 只写从项目里反推出的约定
4. `## 固定问题`
   - 从对应 `fixed_question_file` 载入矩阵项固定问题
   - 如存在匹配的 composite 文件，追加其问题
   - 文件缺失时明确写缺失路径，不补写猜测内容

其中 capability skill 的 `## 结论` 必须明确写出：

- 当前项目命中了哪些宿主引擎
- 每个宿主引擎对应的实现变体

语言层边界：

- C# 命名、分层、生命周期、异步和 Unity 宿主侧编码约定写入 `domain/unity-native-code-architecture.md`
- Lua 业务模块、入口、`require` 组织、业务包结构、UI/事件/配置/网络模块分层写入 `domain/unity-script-layer.md`
- toLua runtime、绑定生成、C#↔Lua 双向互调、热修入口写入 `domain/common-lua-embedding.md`
- 不生成独立 `domain/csharp-coding-rules.md` 或 `domain/lua-architecture.md`；这些旧文件已被 v2 矩阵吸收

`## 固定问题` 写法：

```markdown
## 固定问题

- fixed_question_file: $CLAUDE_PLUGIN_ROOT/skills/embed/fixed-questions/...
- composite_fixed_question_files:
  - $CLAUDE_PLUGIN_ROOT/skills/embed/fixed-questions/composite/...
- status: loaded | missing
- questions:
  - Q1 ...
  - Q2 ...
```

如果对应文件不存在，改写为：

```markdown
## 固定问题

- fixed_question_file: $CLAUDE_PLUGIN_ROOT/skills/embed/fixed-questions/...
- status: missing
- note: 对应矩阵项的固定问题文件尚未创建，禁止补写推断性问题。
```

## 生成列表展示规则

展示给用户的确认表必须同时包含：

- `文件名`
- `matrix_id`
- `作用说明`
- `状态`
  - `新建`
  - `已存在，将覆盖`
  - `已存在，--update 下跳过`

### 示例

```text
根据当前矩阵结果，将生成以下 domain skill：

.seed/skills/domain/
  unity-project-structure.md                        | engine.unity.project_structure                     | 当前引擎目录结构与模块划分 | 新建
  unity-ui-system.md                               | engine.unity.ui_system                            | 当前引擎 UI 栈与界面组织   | 新建
  common-lua-embedding.md                          | capability.lua_embedding                          | Lua runtime 与桥接约定     | 新建
  common-build-release-and-cicd.md                 | capability.build_release_and_cicd                 | 构建发布与 CI/CD           | 已存在，将覆盖
```

## 扩展规则

 1. 如果项目命中了 registry 未覆盖的**同层级方向变体**，允许在既有矩阵文件中追加一节，不新增新的顶层分类轴。
2. 如果项目确实需要新增 capability，先补 registry，再补 question set，再允许 catalog 生成。
3. 如果证据不足，不要取消生成；保留该 skill，让 builder 依据 researcher 报告决定是否写成占位 skill。
