---
name: fixed-questions-composite-unity-bridge-layer-lua-embedding
description: unity / bridge-layer x lua-embedding 交叉固定问题模板
composite_id: composite.unity.bridge_layer.lua_embedding
axis: composite
engine: unity
direction_id: bridge_layer
capability: lua_embedding
capability_id: lua_embedding
owner: builder-unity
researcher_owner: researcher-unity
capability_owner: researcher-lua
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.unity.bridge_layer.lua_embedding` 的交叉固定问题模板。
- 这里只补 `engine.unity.bridge_layer` 与 `capability.lua_embedding` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/unity/bridge-layer.md` 和 `fixed-questions/capability/lua-embedding.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。

## 交叉固定问题

- id: unity_bridge_layer_lua_embedding_q1
  question: 项目使用哪套 Lua 方案承载桥接层，例如 xLua、tolua 或其他实现，桥接初始化与平台桥接模块的汇合点在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Assets/Plugins/
      - Packages/
      - Lua/
    keywords:
      - xLua
      - tolua
      - LuaEnv
      - LuaManager
      - bridge
      - init
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_bridge_layer_lua_embedding_q2
  question: 桥接给 Lua 调用的 C# / 原生能力白名单写在哪里，是否通过 LuaCallCSharp、CSharpCallLua 或手写 Wrapper 维护？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Tools/
      - Lua/
    keywords:
      - LuaCallCSharp
      - CSharpCallLua
      - GenConfig
      - wrap
      - bridge api
      - whitelist
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_bridge_layer_lua_embedding_q3
  question: Lua 是否只能通过统一的 C# Facade 访问登录、支付、分享、推送等平台能力，这个 Facade / Service 层写在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Assets/Plugins/
      - Packages/
      - Lua/
    keywords:
      - Facade
      - Service
      - SDKManager
      - Login
      - Payment
      - Lua
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_bridge_layer_lua_embedding_q4
  question: 原生 SDK 回调返回 Unity 后，是如何继续传递到 Lua 的，回调路径是 UnitySendMessage、委托、事件总线还是消息队列？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Assets/Plugins/
      - Packages/
      - Lua/
    keywords:
      - UnitySendMessage
      - callback
      - delegate
      - event
      - queue
      - LuaFunction
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_bridge_layer_lua_embedding_q5
  question: Lua 发起异步桥接调用时，结果是通过回调、Promise 风格封装、协程 yield 还是事件通知返回的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Lua/
    keywords:
      - callback
      - promise
      - coroutine
      - yield
      - async
      - await
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_bridge_layer_lua_embedding_q6
  question: 桥接层传给 Lua 的 Unity 对象、原生句柄或数据结构是如何封装和管理生命周期的，是否存在手写适配器或缓存层？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Assets/Plugins/
      - Packages/
      - Lua/
    keywords:
      - userdata
      - wrapper
      - cache
      - GC
      - Dispose
      - adapter
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_bridge_layer_lua_embedding_q7
  question: 为了让 Lua 在编辑器内可运行，桥接层是否提供了 Editor Mock、Stub 或假实现，平台切换逻辑写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Assets/Editor/
      - Packages/
      - Lua/
    keywords:
      - UNITY_EDITOR
      - mock
      - stub
      - fake
      - platform switch
      - editor implementation
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_bridge_layer_lua_embedding_q8
  question: 原生线程或平台线程回调进入 Lua 前，是否统一切回 Unity 主线程，主线程分发器或同步上下文入口在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Assets/Plugins/
      - Packages/
      - Lua/
    keywords:
      - MainThread
      - Dispatcher
      - SynchronizationContext
      - Post
      - queue
      - callback
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_bridge_layer_lua_embedding_q9
  question: 桥接相关的 Wrapper、生成代码或平台专属脚本是如何按 Android / iOS / Editor 分目录和分程序集管理的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Plugins/
      - Assets/
      - Packages/
      - Tools/
    keywords:
      - Android
      - iOS
      - Editor
      - wrap
      - generated
      - asmdef
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_bridge_layer_lua_embedding_q10
  question: Lua 通过桥接层调用平台能力失败时，错误码、超时、重试和日志回传给 Lua 的统一处理入口在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Assets/Plugins/
      - Packages/
      - Lua/
    keywords:
      - errorCode
      - timeout
      - retry
      - log
      - callback error
      - exception
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

## 交叉搜索提示

- paths:
  - `Assets/`
  - `Assets/Plugins/`
  - `Assets/Plugins/Android/`
  - `Assets/Plugins/iOS/`
  - `Assets/Editor/`
  - `Packages/`
  - `Lua/`
- keywords:
  - `LuaEnv`
  - `LuaCallCSharp`
  - `CSharpCallLua`
  - `UnitySendMessage`
  - `AndroidJavaObject`
  - `DllImport`
  - `SDKManager`
  - `callback`
  - `mock`
  - `MainThread`
