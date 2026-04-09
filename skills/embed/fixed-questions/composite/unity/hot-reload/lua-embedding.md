---
name: fixed-questions-composite-unity-hot-reload-lua-embedding
description: unity / hot-reload x lua-embedding 交叉固定问题模板
composite_id: composite.unity.hot_reload.lua_embedding
axis: composite
engine: unity
direction_id: hot_reload
capability: lua_embedding
capability_id: lua_embedding
owner: builder-unity
researcher_owner: researcher-unity
capability_owner: researcher-lua
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.unity.hot_reload.lua_embedding` 的交叉固定问题模板。
- 这里只补 `engine.unity.hot_reload` 与 `capability.lua_embedding` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/unity/hot-reload.md` 和 `fixed-questions/capability/lua-embedding.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。

## 交叉固定问题

- id: unity_hot_reload_lua_embedding_q1
  question: 项目里的 Lua 是否本身就是主要热更载荷，还是只在 DLL 热更旁边承担少量脚本补丁职责？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Lua/
      - Assets/StreamingAssets/
    keywords:
      - hotfix
      - LuaEnv
      - lua patch
      - hot update
      - dll
      - script patch
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_lua_embedding_q2
  question: Lua 热更脚本在主包、StreamingAssets、远端 CDN 和持久化目录中的存放位置分别是什么，加载优先级如何决定？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Assets/StreamingAssets/
      - Packages/
      - Lua/
    keywords:
      - StreamingAssets
      - persistentDataPath
      - require
      - load path
      - CDN
      - priority
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_lua_embedding_q3
  question: Lua 的 require / CustomLoader / AddLoader 是否专门支持热更补丁目录，相关路径拼装和解密逻辑写在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Lua/
      - Assets/StreamingAssets/
    keywords:
      - AddLoader
      - CustomLoader
      - require
      - loader
      - decrypt
      - persistentDataPath
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_lua_embedding_q4
  question: Lua 模块热重载时是否规定了模块失效、依赖重载和执行顺序，避免旧模块残留在 package.loaded 中？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Lua/
    keywords:
      - package.loaded
      - reload
      - dependency
      - order
      - require
      - module
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_lua_embedding_q5
  question: Lua 热更后，界面状态、游戏状态、缓存数据和持有中的 LuaTable / LuaFunction 是如何续接或重建的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Lua/
    keywords:
      - LuaTable
      - LuaFunction
      - state
      - rebuild
      - cache
      - restore
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_lua_embedding_q6
  question: 热更后的 Lua 代码如何重新绑定按钮、事件、委托和原生回调，是否存在统一的 rebind 入口？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Lua/
    keywords:
      - rebind
      - callback
      - delegate
      - event
      - AddListener
      - register
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_lua_embedding_q7
  question: Lua 热更版本号、补丁清单、文件哈希和下载地址配置放在哪里，是否支持增量补丁与版本回退？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Assets/StreamingAssets/
      - Packages/
      - Lua/
    keywords:
      - manifest
      - version
      - hash
      - rollback
      - patch list
      - remote url
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_lua_embedding_q8
  question: 加载 Lua 补丁失败时，项目是回滚到旧脚本、禁用热更还是终止启动，兜底逻辑放在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Lua/
      - Assets/StreamingAssets/
    keywords:
      - rollback
      - fallback
      - disable hotfix
      - error
      - retry
      - fail
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_lua_embedding_q9
  question: 为了降低热更新风险，Lua 热更层是否限制可调用的宿主 API、桥接接口或危险模块，限制点写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Lua/
      - Tools/
    keywords:
      - whitelist
      - blacklist
      - LuaCallCSharp
      - sandbox
      - restrict
      - bridge api
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_lua_embedding_q10
  question: 编辑器下的 Lua 热更模拟与真机发布包是否走同一套打包和加载链路，如果不一致，差异配置在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Assets/
      - Packages/
      - Lua/
    keywords:
      - UNITY_EDITOR
      - simulate
      - build pipeline
      - loader
      - mock patch
      - editor only
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

## 交叉搜索提示

- paths:
  - `Assets/`
  - `Assets/StreamingAssets/`
  - `Assets/Editor/`
  - `Packages/`
  - `Lua/`
  - `Tools/`
- keywords:
  - `LuaEnv`
  - `AddLoader`
  - `CustomLoader`
  - `package.loaded`
  - `persistentDataPath`
  - `manifest`
  - `rollback`
  - `LuaTable`
  - `rebind`
  - `whitelist`
