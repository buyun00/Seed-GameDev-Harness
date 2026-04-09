---
name: fixed-questions-capability-lua-embedding
description: Lua 跨引擎嵌入能力固定问题
matrix_id: capability.lua_embedding
axis: capability
capability: lua_embedding
capability_id: lua_embedding
owner: researcher-lua
question_set_id: qs-common-lua-embedding
scope:
  - agent-inject
---

## 固定问题

- id: lua_embedding_runtime
  question: Lua 运行时是在哪里初始化的？由哪个宿主入口创建并持有？
  must_find: true
  fatal_if_missing: true
- id: lua_embedding_binding
  question: Lua 与宿主语言的绑定生成、注册或桥接清单在哪里定义？
  must_find: true
  fatal_if_missing: true
- id: lua_embedding_boundary
  question: 哪些业务逻辑放在 Lua，哪些留在宿主层？边界在哪里被明确约束？
  must_find: true
  fatal_if_missing: false
- id: lua_embedding_calls
  question: 宿主调 Lua、Lua 调宿主的真实入口分别在哪里？
  must_find: true
  fatal_if_missing: true
- id: lua_embedding_reload
  question: Lua 层是否承担热修/重载职责？如果有，入口和限制在哪里？
  must_find: true
  fatal_if_missing: false

## 搜索提示

- paths:
  - `Assets/`
  - `Scripts/`
  - `Lua/`
  - `Packages/`
  - `Plugins/`
- keywords:
  - `LuaEnv`
  - `DoString`
  - `require`
  - `CSharpCallLua`
  - `LuaCallCSharp`
  - `UnLua`
  - `GDLua`
