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

## 填写说明

- 本文件是 capability.lua_embedding 的固定问题模板。
- 补充 Lua 跨引擎嵌入方案、宿主桥接和职责边界上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该能力对当前项目通常可能为 unsupported，也先保留模板；是否启用由 taxonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: capability_lua_embedding_q1
  question: Lua 运行时是在哪里初始化的？由哪个宿主入口创建并持有？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - `Assets/`
      - `Scripts/`
      - `Lua/`
      - `Packages/`
      - `Plugins/`
    keywords:
      - `LuaEnv`
      - `DoString`
      - `require`
      - `CSharpCallLua`
      - `LuaCallCSharp`
      - `UnLua`
      - `GDLua`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: capability_lua_embedding_q2
  question: Lua 与宿主语言的绑定生成、注册或桥接清单在哪里定义？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - `Assets/`
      - `Scripts/`
      - `Lua/`
      - `Packages/`
      - `Plugins/`
    keywords:
      - `LuaEnv`
      - `DoString`
      - `require`
      - `CSharpCallLua`
      - `LuaCallCSharp`
      - `UnLua`
      - `GDLua`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: capability_lua_embedding_q3
  question: 哪些业务逻辑放在 Lua，哪些留在宿主层？边界在哪里被明确约束？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `Assets/`
      - `Scripts/`
      - `Lua/`
      - `Packages/`
      - `Plugins/`
    keywords:
      - `LuaEnv`
      - `DoString`
      - `require`
      - `CSharpCallLua`
      - `LuaCallCSharp`
      - `UnLua`
      - `GDLua`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: capability_lua_embedding_q4
  question: 宿主调 Lua、Lua 调宿主的真实入口分别在哪里？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - `Assets/`
      - `Scripts/`
      - `Lua/`
      - `Packages/`
      - `Plugins/`
    keywords:
      - `LuaEnv`
      - `DoString`
      - `require`
      - `CSharpCallLua`
      - `LuaCallCSharp`
      - `UnLua`
      - `GDLua`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: capability_lua_embedding_q5
  question: Lua 层是否承担热修/重载职责？如果有，入口和限制在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `Assets/`
      - `Scripts/`
      - `Lua/`
      - `Packages/`
      - `Plugins/`
    keywords:
      - `LuaEnv`
      - `DoString`
      - `require`
      - `CSharpCallLua`
      - `LuaCallCSharp`
      - `UnLua`
      - `GDLua`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
