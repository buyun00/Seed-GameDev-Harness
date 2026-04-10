---
name: fixed-questions-composite-unreal-script-layer-lua-embedding
description: unreal / script-layer x lua-embedding 交叉固定问题模板
composite_id: composite.unreal.script_layer.lua_embedding
axis: composite
engine: unreal
direction_id: script_layer
capability: lua_embedding
capability_id: lua_embedding
owner: builder-engine
researcher_owner: researcher-unreal
capability_owner: researcher-lua
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.unreal.script_layer.lua_embedding` 的交叉固定问题模板。
- 只补充 `engine.unreal.script_layer` 与 `capability.lua_embedding` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/unreal/script-layer.md` 与 `fixed-questions/capability/lua-embedding.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。

## 固定问题

- id: unreal_script_layer_lua_embedding_q1
  question: Lua 运行时在 Unreal 生命周期的哪个阶段初始化，是在模块启动、`GameInstance`、`Subsystem` 还是首个地图加载时？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - "Source/**/*Lua*"
      - "Plugins/**/*Lua*"
      - "Source/**/*GameInstance*"
      - "Source/**/*Subsystem*"
      - "Config/"
    keywords:
      - "LuaState"
      - "Initialize"
      - "GameInstance"
      - "Subsystem"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_script_layer_lua_embedding_q2
  question: Lua 脚本目录是否遵循固定约定，例如 `Content/Script/`、`Content/Lua/` 或插件内脚本目录，模块名与文件路径如何映射？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Content/Script/"
      - "Content/Lua/"
      - "Plugins/**/Content/Script/"
      - "Plugins/**/Content/Lua/"
      - "Source/**/*Lua*"
    keywords:
      - "require"
      - "package.path"
      - "GetModuleName"
      - "ScriptRoot"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_script_layer_lua_embedding_q3
  question: 脚本层是按 Actor、Widget、Subsystem 绑定，还是按系统模块组织，项目内是否有统一的脚本命名空间和加载规范？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Lua*"
      - "Plugins/**/*Lua*"
      - "Content/Script/"
      - "Content/Lua/"
      - "Content/**/BP_*"
    keywords:
      - "Actor"
      - "Widget"
      - "Subsystem"
      - "Namespace"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_script_layer_lua_embedding_q4
  question: 静态绑定与动态绑定分别承担什么场景，例如静态绑定给蓝图类，动态绑定给运行时 Spawn 对象，项目里是否混用？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Lua*"
      - "Plugins/**/*Lua*"
      - "Source/**/*Binding*"
      - "Tools/"
    keywords:
      - "StaticExport"
      - "Dynamic"
      - "Binding"
      - "Spawn"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_script_layer_lua_embedding_q5
  question: Lua 脚本是否承担主 gameplay 逻辑、UI 流程、配置解释、运营逻辑或热修复，职责边界在何处最清晰？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Content/Script/"
      - "Content/Lua/"
      - "Source/**/*Lua*"
      - "Plugins/**/*Lua*"
      - "Content/**/WBP_*"
    keywords:
      - "Gameplay"
      - "UI"
      - "Hotfix"
      - "Config"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_script_layer_lua_embedding_q6
  question: 协程、latent function、异步回调在脚本层如何接入 Unreal 的 tick、timer、delegate 与异步任务系统？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Lua*"
      - "Plugins/**/*Lua*"
      - "Source/**/*Timer*"
      - "Source/**/*Async*"
    keywords:
      - "Coroutine"
      - "Timer"
      - "AsyncTask"
      - "Latent"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_script_layer_lua_embedding_q7
  question: 脚本层是否直接覆写 `BlueprintEvent`、`RepNotify`、`InputEvent`、`AnimNotify` 等引擎事件，还是统一转发到脚本调度器？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Lua*"
      - "Plugins/**/*Lua*"
      - "Source/**/*.h"
      - "Content/**/BP_*"
      - "Content/**/ABP_*"
    keywords:
      - "BlueprintEvent"
      - "RepNotify"
      - "InputEvent"
      - "AnimNotify"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_script_layer_lua_embedding_q8
  question: Lua 错误、死循环、panic、超时与日志输出如何反馈到 Unreal 日志、编辑器提示或远程调试器？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Lua*"
      - "Plugins/**/*Lua*"
      - "Source/**/*Log*"
      - "Config/"
    keywords:
      - "panic"
      - "dead loop"
      - "UE_LOG"
      - "debugger"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_script_layer_lua_embedding_q9
  question: Lua 脚本文件在打包时如何进入发布物，是作为普通资源、Non-Asset 文件、pak 附件还是额外下载内容？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/"
      - "Build/"
      - "Scripts/"
      - "Content/Script/"
      - "Content/Lua/"
    keywords:
      - "Additional Non-Asset Directories"
      - "NonUFS"
      - "Pak"
      - "Stage"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_script_layer_lua_embedding_q10
  question: 是否支持 Lua 脚本热重载、模块卸载、状态迁移和对象重绑，热重载后哪些对象可以保活，哪些必须重建？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Lua*"
      - "Plugins/**/*Lua*"
      - "Content/Script/"
      - "Content/Lua/"
      - "Config/"
    keywords:
      - "reload"
      - "hotfix"
      - "hot reload"
      - "rebind"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
