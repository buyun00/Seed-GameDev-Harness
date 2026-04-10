---
name: embed-researcher-lua
description: /seed:embed Lua capability researcher 扫描剧本
triggers:
  - embed lua researcher
  - lua scan
  - lua embedding scan
domain:
  - project-analysis
scope:
  - agent-inject
---

## 加载顺序

创建 `researcher-lua` 前，必须先加载：

1. `$CLAUDE_PLUGIN_ROOT/skills/embed/researcher-common.md`
2. `$CLAUDE_PLUGIN_ROOT/skills/embed/researcher-runtime-common.md`
3. `$CLAUDE_PLUGIN_ROOT/skills/embed/taxonomy-registry.md`
4. `$CLAUDE_PLUGIN_ROOT/skills/embed/researcher-lua.md`

## TaskCreate 模板

```text
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: Lua 跨引擎能力调查报告；写入 `.seed/state/embed/<embed_stamp>/reports/researcher-lua.yaml`（原子写）；写完后 SendMessage 通知 leader 路径 + 状态摘要
Done Definition: 报告按 researcher-common 的四段格式输出；所有结论和 fixed_question_results 都附证据路径；覆盖 capability.lua_embedding；如 Lua 层承担 fixed-questions 中的 fatal 运行时主路径但实际实现缺失，则按 researcher-runtime-common 输出必查项缺失错误
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目 Lua 跨引擎嵌入能力，为生成 common-lua-embedding.md 提供依据
Scope Coverage: lua_embedding
Exclusions: 任意引擎主线方向、配置表、网络、CI/CD、工具链
```

## 扫描剧本

### 识别 Lua runtime / bridge 变体

- 搜索 `Assets/XLua/`、`Assets/ToLua/`、`Assets/Slua/`、`GDLua`、`UnLua`
- 搜索 `using XLua;`、`using LuaInterface;`、`using SLua;`、`LuaEnv`、`DoString`
- 搜索各引擎宿主侧的 Lua 初始化入口、绑定生成入口、脚本根目录
- 如果命中多套互斥方案，必须输出冲突，不自行裁决

### Lua 模块与入口

- 搜索 `require(`、`dofile(`、模块返回表、`Main.lua`、启动入口、Facade/Manager 代理
- 只有定位到实际入口与模块加载方式，才能写模块系统结论

### 双向互调 / 热修 / 错误处理

- 搜索 `CSharpCallLua`、`LuaCallCSharp`、委托注册、回调桥接、绑定配置
- 搜索 `Hotfix`、`patch`、`reload`、`hotupdate`
- 搜索 `pcall`、`xpcall`、`error(`、`LogError`、日志封装
- 如果只找到框架依赖，没有互调调用点，写 `unknown`，不要补写 bridge 规则

### Fixed Questions 中的 Lua 运行时落点

- 如果已加载 fixed-questions 指向的运行时主路径主要落在 Lua 层，必须把 Lua 侧实现路径写清楚
- 如果这些行为主要在宿主引擎层，则标明“Lua 不承担主路径”，不要强行补写

## 输出要求

- `common-lua-embedding.md` 只写 Lua 跨引擎能力，不复写引擎主线方向
- Lua 业务模块、入口、`require` 组织、业务包结构、UI/事件/配置/网络模块分层属于当前引擎的 `script_layer`，必须作为旁注交给对应 engine researcher，不要吞进 `common-lua-embedding.md`
- 如果命中 GDLua / UnLua，也要保留与对应引擎侧桥接入口的证据
