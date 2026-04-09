---
name: fixed-questions-composite-cocos-bridge-layer-lua-embedding
description: cocos / bridge-layer x lua-embedding 交叉固定问题模板
composite_id: composite.cocos.bridge_layer.lua_embedding
axis: composite
engine: cocos
direction_id: bridge_layer
capability: lua_embedding
capability_id: lua_embedding
owner: builder-cocos
researcher_owner: researcher-cocos
capability_owner: researcher-lua
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.cocos.bridge_layer.lua_embedding` 的交叉固定问题模板。
- 只补充 `engine.cocos.bridge_layer` 与 `capability.lua_embedding` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/cocos/bridge-layer.md` 和 `fixed-questions/capability/lua-embedding.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 当前先留空模板，后续按实际项目与复用频次补充问题。

## 固定问题

- id: cocos_bridge_layer_lua_embedding_q1
  question: Lua VM 初始化与原生桥接注册的先后顺序在哪里定义，是先起 `LuaEngine`/`LuaStack` 再注册 SDK 桥，还是先初始化原生桥后再暴露给 Lua？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - frameworks/runtime-src/Classes/
      - frameworks/cocos2d-x/cocos/scripting/lua-bindings/
      - src/
      - script/
      - lua/
    keywords:
      - LuaEngine
      - LuaStack
      - register_all
      - bridge
      - startup
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_bridge_layer_lua_embedding_q2
  question: 原生 SDK 能力暴露给 Lua 的统一入口在哪里，项目使用 `LuaBridge`、`tolua` 自动绑定、手写 wrapper 还是一层 Lua service/facade 收口？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - frameworks/runtime-src/Classes/
      - plugins/
      - src/
      - script/
      - lua/
    keywords:
      - tolua
      - LuaBridge
      - wrapper
      - sdk
      - register_all
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_bridge_layer_lua_embedding_q3
  question: Lua 调原生时传参是走 JSON、字符串约定、数字 handler、table 映射还是二进制协议，序列化和反序列化逻辑落在哪一层？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - frameworks/runtime-src/Classes/
      - src/
      - script/
      - lua/
      - plugins/
    keywords:
      - JSON
      - payload
      - handler
      - serialize
      - table
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_bridge_layer_lua_embedding_q4
  question: 原生回调回到 Lua 时是否显式切回主线程或游戏线程，线程切换和调度入口写在 `Scheduler`、桥接管理器还是平台 wrapper 中？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - frameworks/runtime-src/Classes/
      - proj.android-studio/
      - proj.ios_mac/
      - plugins/
      - src/
    keywords:
      - Scheduler
      - runOnGLThread
      - dispatch
      - callback
      - main thread
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_bridge_layer_lua_embedding_q5
  question: 桥接层中 Lua function handler、回调引用和生命周期由谁管理，项目是否显式做注册、释放、反注册和异常兜底？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - frameworks/runtime-src/Classes/
      - frameworks/cocos2d-x/cocos/scripting/lua-bindings/
      - src/
      - lua/
    keywords:
      - executeFunctionByHandler
      - retainScriptHandler
      - releaseScriptHandler
      - callback
      - handler
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_bridge_layer_lua_embedding_q6
  question: 自动生成绑定与手写绑定分别位于哪些目录，例如 `lua_*.cpp`、`manual`、`auto`、`register_all_*`，两类绑定的职责边界是什么？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - frameworks/runtime-src/Classes/
      - frameworks/cocos2d-x/cocos/scripting/lua-bindings/
      - tools/
      - plugins/
    keywords:
      - lua_*.cpp
      - manual
      - auto
      - register_all
      - bindings-generator
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_bridge_layer_lua_embedding_q7
  question: 是否存在一层对平台差异的 Lua 侧统一门面，把 Android、iOS、不同 SDK 的差异收口为同一组 Lua API；门面目录在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - lua/
      - script/
      - src/
      - plugins/
      - frameworks/runtime-src/Classes/
    keywords:
      - facade
      - platform
      - ios
      - android
      - sdk
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_bridge_layer_lua_embedding_q8
  question: Lua 脚本、字节码或加密脚本在桥接调用链上是如何被定位和加载的，`package.path`、search path 或可写目录是在哪里注入的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - src/
      - res/
      - script/
      - lua/
      - frameworks/runtime-src/Classes/
    keywords:
      - package.path
      - addSearchPath
      - writablePath
      - xxtea
      - luacompile
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_bridge_layer_lua_embedding_q9
  question: 桥接调用失败、原生返回码异常、权限拒绝或参数不合法时，错误是如何回传到 Lua 的，是否有统一错误码和日志上报？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - frameworks/runtime-src/Classes/
      - plugins/
      - lua/
      - script/
      - src/
    keywords:
      - error
      - code
      - permission
      - fail
      - callback
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_bridge_layer_lua_embedding_q10
  question: 编辑器、预览或无原生宿主环境下，Lua 桥接是否有 mock/stub/fallback 实现，方便业务在不连真机时跑通 Lua 逻辑？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - lua/
      - script/
      - src/
      - tools/
      - plugins/
    keywords:
      - mock
      - stub
      - preview
      - fallback
      - editor
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
