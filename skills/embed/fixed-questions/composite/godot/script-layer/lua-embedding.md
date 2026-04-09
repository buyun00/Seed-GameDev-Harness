---
name: fixed-questions-composite-godot-script-layer-lua-embedding
description: godot / script-layer x lua-embedding 交叉固定问题模板
composite_id: composite.godot.script_layer.lua_embedding
axis: composite
engine: godot
direction_id: script_layer
capability: lua_embedding
capability_id: lua_embedding
owner: builder-godot
researcher_owner: researcher-godot
capability_owner: researcher-lua
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.godot.script_layer.lua_embedding` 的交叉固定问题模板。
- 这里只补 `engine.godot.script_layer` 与 `capability.lua_embedding` 叠加后新增的必查问题。
- 不重复 `fixed-questions/engine/godot/script-layer.md` 和 `fixed-questions/capability/lua-embedding.md` 已覆盖的基础问题。
- 每条问题都单独给出 `search_hints.paths` 与 `search_hints.keywords`，目录 hint 已下沉到问题级别。

## 交叉固定问题

- id: godot_script_layer_lua_embedding_q1
  question: Lua 在脚本层的真正启动入口写在哪里，是 autoload 的 `_init()`、`_ready()`、主场景启动脚本，还是某个统一 `LuaManager` 或 `LuaState` service？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - autoload/
      - scripts/
      - scenes/
      - lua/
      - "*.gd"
      - "*.cs"
    keywords:
      - LuaManager
      - LuaState
      - _init
      - _ready
      - autoload
      - bootstrap
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_script_layer_lua_embedding_q2
  question: 项目中的 GDScript、C# 与 Lua 的职责边界是什么，哪些节点生命周期和玩法逻辑会下沉到 Lua，哪些仍保留在宿主脚本层？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - scripts/
      - lua/
      - gameplay/
      - autoload/
      - "*.gd"
      - "*.cs"
    keywords:
      - Lua
      - GDScript
      - C#
      - gameplay
      - service
      - bridge
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_script_layer_lua_embedding_q3
  question: Lua 脚本文件是通过 `res://`、`user://`、资源包挂载路径还是文本资源加载进来的，脚本层是否对 `require` 或 `do_file` 做了路径封装？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - lua/
      - mods/
      - patch/
      - scripts/
      - "*.gd"
      - "*.lua"
    keywords:
      - require
      - do_file
      - res://
      - user://
      - package.path
      - load_resource_pack
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_script_layer_lua_embedding_q4
  question: Lua 如果能直接挂到 `Node` 或 `Resource`，上层脚本层是否实现了 `ScriptLanguageExtension` 相关集成；如果不能，脚本层又是如何把宿主回调转发给 Lua 的？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - addons/
      - scripts/
      - bridge/
      - modules/
      - "*.gd"
      - "*.cpp"
    keywords:
      - ScriptLanguageExtension
      - ScriptExtension
      - Node
      - Resource
      - callback
      - LuaScript
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_script_layer_lua_embedding_q5
  question: `_ready()`、`_process()`、`_physics_process()`、输入回调、signal 回调和 RPC 回调这些典型脚本生命周期，哪些会被宿主脚本继续转发到 Lua？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - scripts/
      - autoload/
      - gameplay/
      - "*.gd"
      - "*.cs"
      - "*.lua"
    keywords:
      - _ready
      - _process
      - _physics_process
      - signal
      - rpc
      - input
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_script_layer_lua_embedding_q6
  question: Lua 侧异常、语法错误和运行时错误是如何回流到 Godot 脚本层的，是否会被包装成统一错误对象、日志接口或调试面板输出？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - scripts/
      - lua/
      - debug/
      - logs/
      - "*.gd"
      - "*.lua"
    keywords:
      - error
      - traceback
      - printerr
      - push_error
      - debug
      - exception
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_script_layer_lua_embedding_q7
  question: Lua 代码是否能够直接发射或订阅 Godot signal，或由宿主脚本层代为桥接 `Callable`、await signal 和事件派发？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - scripts/
      - lua/
      - bridge/
      - events/
      - "*.gd"
      - "*.lua"
    keywords:
      - signal
      - Callable
      - await
      - connect
      - emit_signal
      - event
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_script_layer_lua_embedding_q8
  question: Inspector 暴露的参数、`@export` 契约或 `Resource` 配置如果最终驱动 Lua 行为，是在宿主脚本层做适配，还是 Lua 元数据本身支持这些编辑器能力？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - scripts/
      - resources/
      - lua/
      - addons/
      - "*.gd"
      - "*.tres"
    keywords:
      - @export
      - export
      - inspector
      - Resource
      - metadata
      - lua
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_script_layer_lua_embedding_q9
  question: Lua 模块缓存、热重载、脚本替换和状态保留是由脚本层自己管理，还是完全交给底层 Lua bridge 或 ScriptLanguage 扩展？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - lua/
      - scripts/
      - bridge/
      - hotfix/
      - debug/
      - "*.gd"
    keywords:
      - cache
      - reload
      - hotfix
      - module
      - ScriptLanguage
      - LuaState
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_script_layer_lua_embedding_q10
  question: 是否存在专门面向 Lua 的脚本层调试工具、REPL、测试入口或编辑器插件，它们与普通 GDScript、C# 脚本工作流是如何并存的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - addons/
      - debug/
      - tests/
      - tools/
      - lua/
      - "*.gd"
    keywords:
      - repl
      - console
      - debug
      - test
      - editor plugin
      - lua
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
