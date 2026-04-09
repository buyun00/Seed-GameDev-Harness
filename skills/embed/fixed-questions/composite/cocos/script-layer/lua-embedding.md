---
name: fixed-questions-composite-cocos-script-layer-lua-embedding
description: cocos / script-layer x lua-embedding 交叉固定问题模板
composite_id: composite.cocos.script_layer.lua_embedding
axis: composite
engine: cocos
direction_id: script_layer
capability: lua_embedding
capability_id: lua_embedding
owner: builder-cocos
researcher_owner: researcher-cocos
capability_owner: researcher-lua
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.cocos.script_layer.lua_embedding` 的交叉固定问题模板。
- 只补充 `engine.cocos.script_layer` 与 `capability.lua_embedding` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/cocos/script-layer.md` 和 `fixed-questions/capability/lua-embedding.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 当前先留空模板，后续按实际项目与复用频次补充问题。

## 固定问题

- id: cocos_script_layer_lua_embedding_q1
  question: 项目启动时，Cocos 脚本层入口与 Lua 运行时入口的先后顺序在哪里定义，是脚本层先完成引擎初始化再拉起 Lua，还是 Lua 主导业务入口？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - assets/
      - assets/scripts/
      - src/
      - script/
      - lua/
      - frameworks/runtime-src/Classes/
    keywords:
      - startup
      - main
      - LuaEngine
      - LuaStack
      - entry
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_script_layer_lua_embedding_q2
  question: Lua 脚本目录、资源目录和 `package.path`/search path 是如何在工程里组织的，它们与 TypeScript/JavaScript 目录边界是否清晰？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
      - src/
      - script/
      - lua/
      - res/
    keywords:
      - package.path
      - require
      - search path
      - ts
      - js
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_script_layer_lua_embedding_q3
  question: 哪些业务模块明确放在 Lua，哪些仍留在 TS/JS 或 C++；这种边界是通过目录、命名约定还是桥接门面来约束的？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/scripts/
      - src/
      - script/
      - lua/
      - frameworks/runtime-src/Classes/
    keywords:
      - lua
      - script
      - bridge
      - module
      - facade
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_script_layer_lua_embedding_q4
  question: Cocos 组件生命周期如 `onLoad`、`start`、`update`、`onDestroy` 若需要驱动 Lua 逻辑，是由哪一层脚本 wrapper 或宿主组件转发给 Lua 的？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
      - src/
      - script/
      - lua/
    keywords:
      - onLoad
      - start
      - update
      - onDestroy
      - Component
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_script_layer_lua_embedding_q5
  question: Lua 层如何接入 Cocos 事件、定时器、Tween、schedule 和资源加载能力，项目是否存在一层专门给 Lua 用的脚本层 facade？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - lua/
      - script/
      - assets/scripts/
      - src/
      - assets/
    keywords:
      - eventBus
      - schedule
      - Tween
      - resources.load
      - facade
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_script_layer_lua_embedding_q6
  question: 配置表、协议代码、枚举和自动生成代码若同时供 Lua 消费，生成物目录和 Lua 读取入口是否与 TS/JS 脚本层分开维护？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - tools/
      - scripts/
      - lua/
      - script/
      - assets/generated/
      - assets/config/
    keywords:
      - generated
      - config
      - proto
      - enum
      - codegen
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_script_layer_lua_embedding_q7
  question: Lua 与脚本层共享的单例、服务定位器、事件总线或 UI 框架位于哪里，双方是共享同一套对象还是各自包一层代理？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/scripts/
      - src/
      - script/
      - lua/
      - assets/ui/
    keywords:
      - singleton
      - ServiceLocator
      - eventBus
      - ui
      - proxy
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_script_layer_lua_embedding_q8
  question: Lua 调试、异常栈、日志上报和错误恢复是如何穿过脚本层边界的，是否能从 JS/TS 或 C++ 日志里还原 Lua 调用链？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - lua/
      - script/
      - assets/scripts/
      - src/
      - frameworks/runtime-src/Classes/
    keywords:
      - error
      - stack
      - log
      - traceback
      - report
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_script_layer_lua_embedding_q9
  question: Lua 模块重载、热修或远端脚本注入若存在，是由脚本层统一调度还是 Lua 自己处理；入口和限制点落在哪个目录？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - lua/
      - script/
      - assets/scripts/
      - src/
      - remote-assets/
    keywords:
      - reload
      - hotfix
      - require
      - remote script
      - inject
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_script_layer_lua_embedding_q10
  question: 编辑器预览、Web 预览或无 Lua 运行时场景下，脚本层是否有 mock/fallback 逻辑让业务模块仍能启动，替代逻辑在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/scripts/
      - src/
      - script/
      - lua/
      - tools/
    keywords:
      - mock
      - fallback
      - preview
      - editor
      - stub
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
