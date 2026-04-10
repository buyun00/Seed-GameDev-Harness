---
name: fixed-questions-composite-godot-bridge-layer-lua-embedding
description: godot / bridge-layer x lua-embedding 交叉固定问题模板
composite_id: composite.godot.bridge_layer.lua_embedding
axis: composite
engine: godot
direction_id: bridge_layer
capability: lua_embedding
capability_id: lua_embedding
owner: builder-engine
researcher_owner: researcher-godot
capability_owner: researcher-lua
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.godot.bridge_layer.lua_embedding` 的交叉固定问题模板。
- 这里只补 `engine.godot.bridge_layer` 与 `capability.lua_embedding` 叠加后新增的必查问题。
- 不重复 `fixed-questions/engine/godot/bridge-layer.md` 和 `fixed-questions/capability/lua-embedding.md` 已覆盖的基础问题。
- 每条问题都单独给出 `search_hints.paths` 与 `search_hints.keywords`，目录 hint 已下沉到问题级别。

## 固定问题

- id: godot_bridge_layer_lua_embedding_q1
  question: Godot 与 Lua 的宿主桥接是落在 GDExtension、原生模块、C# bridge 还是纯 GDScript addon 上，Lua 运行时由哪个桥接入口创建并持有？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - addons/
      - modules/
      - bin/
      - lib/
      - "*.gdextension"
      - "*.cs"
    keywords:
      - GDExtension
      - GDNative
      - register_types
      - LuaState
      - bridge
      - lua
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_bridge_layer_lua_embedding_q2
  question: 项目里的 Lua 集成属于脚本语言扩展还是沙箱运行时 API，是否实现了 `ScriptLanguageExtension` 或 `ScriptExtension` 让 Lua 能直接挂到 `Node` 或 `Resource` 上？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - addons/
      - modules/
      - scripts/
      - "*.cpp"
      - "*.h"
      - "*.gd"
    keywords:
      - ScriptLanguageExtension
      - ScriptExtension
      - language
      - script
      - LuaScript
      - Resource
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_bridge_layer_lua_embedding_q3
  question: Godot 暴露给 Lua 的 API 面是白名单沙箱、按模块注入，还是近似完整 `Variant`、`Object` 绑定，白名单与注册表写在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - addons/
      - modules/
      - bindings/
      - bridge/
      - scripts/
      - "*.lua"
    keywords:
      - whitelist
      - sandbox
      - Variant
      - Object
      - bind
      - register
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_bridge_layer_lua_embedding_q4
  question: `Variant`、`Object`、`RefCounted`、`Callable`、`Signal` 等 Godot 对象跨到 Lua 后是如何表示的，是 userdata、table、metatable 还是自定义代理对象？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - modules/
      - bridge/
      - bindings/
      - "*.cpp"
      - "*.h"
      - "*.lua"
    keywords:
      - userdata
      - metatable
      - Variant
      - Callable
      - Signal
      - RefCounted
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_bridge_layer_lua_embedding_q5
  question: Lua 侧持有的 Godot 对象在宿主对象释放、节点 `queue_free()` 或引用失效后，桥接层如何避免悬垂引用和错误访问？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - bridge/
      - modules/
      - bindings/
      - "*.cpp"
      - "*.h"
      - "*.gd"
    keywords:
      - queue_free
      - weakref
      - RefCounted
      - free
      - invalid
      - lifetime
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_bridge_layer_lua_embedding_q6
  question: 宿主回调 Lua、Lua 回调宿主时是否要求主线程执行，桥接层有没有把 `_process`、`_physics_process`、signal 或 RPC 回调切回主线程的约束？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - bridge/
      - modules/
      - autoload/
      - scripts/
      - "*.cpp"
      - "*.gd"
    keywords:
      - _process
      - _physics_process
      - main thread
      - call_deferred
      - signal
      - rpc
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_bridge_layer_lua_embedding_q7
  question: Lua 模块搜索路径是否支持 `res://`、`user://`、PCK 挂载目录或外部 mod 目录，这些路径是在哪个桥接初始化步骤里配置的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - lua/
      - mods/
      - patch/
      - autoload/
      - bridge/
      - "*.gd"
    keywords:
      - require
      - package.path
      - res://
      - user://
      - load_resource_pack
      - mod
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_bridge_layer_lua_embedding_q8
  question: 桥接层对 Lua 标准库的开放范围如何控制，像 `io`、`os`、`package`、`debug` 这类高风险能力是否被裁剪或替换？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - bridge/
      - modules/
      - sandbox/
      - addons/
      - "*.cpp"
      - "*.lua"
    keywords:
      - io
      - os
      - package
      - debug
      - sandbox
      - whitelist
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_bridge_layer_lua_embedding_q9
  question: 导出时 Lua 运行库、Godot 扩展动态库和 `.gdextension` 描述文件如何按平台一起打包，缺少任一桥接二进制时项目会如何降级？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - export_presets.cfg
      - bin/
      - lib/
      - "*.gdextension"
      - .github/workflows/
      - build/
    keywords:
      - gdextension
      - dll
      - so
      - dylib
      - export
      - fallback
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_bridge_layer_lua_embedding_q10
  question: 桥接层暴露给上层脚本的 public API 是否集中封装成单一 facade，例如 `LuaState`、`LuaBridge`、`LuaManager`，还是散落在多个插件脚本和原生类里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - autoload/
      - addons/
      - bridge/
      - scripts/
      - "*.gd"
      - "*.cs"
    keywords:
      - LuaManager
      - LuaBridge
      - LuaState
      - singleton
      - facade
      - service
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
