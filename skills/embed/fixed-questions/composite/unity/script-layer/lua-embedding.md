---
name: fixed-questions-composite-unity-script-layer-lua-embedding
description: unity / script-layer x lua-embedding 交叉固定问题模板
composite_id: composite.unity.script_layer.lua_embedding
axis: composite
engine: unity
direction_id: script_layer
capability: lua_embedding
capability_id: lua_embedding
owner: builder-engine
researcher_owner: researcher-unity
capability_owner: researcher-lua
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.unity.script_layer.lua_embedding` 的交叉固定问题模板。
- 这里只补 `engine.unity.script_layer` 与 `capability.lua_embedding` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/unity/script-layer.md` 和 `fixed-questions/capability/lua-embedding.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。

## 固定问题

- id: unity_script_layer_lua_embedding_q1
  question: Lua 脚本层的首个业务入口是如何从 Unity C# 脚本层拉起的，入口 MonoBehaviour、Manager 或 Bootstrap 写在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/Scenes/
    keywords:
      - LuaEnv
      - DoString
      - require
      - Bootstrap
      - LuaManager
      - LuaMain
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_script_layer_lua_embedding_q2
  question: Unity 生命周期是如何映射给 Lua 的，是否存在 LuaBehaviour、代理组件或 Update / Awake / OnDestroy 的转发层？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - LuaBehaviour
      - LuaComponent
      - Awake
      - Start
      - Update
      - OnDestroy
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_script_layer_lua_embedding_q3
  question: 哪些 UI、玩法或流程控制脚本明确下沉到 Lua 层，Unity C# 脚本层又保留了哪些宿主职责？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Lua/
    keywords:
      - UI
      - Lua
      - panel
      - controller
      - gameplay
      - host
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_script_layer_lua_embedding_q4
  question: Lua 模块和 Unity Prefab、Panel、场景对象之间是如何绑定的，脚本名、组件代理或配置映射放在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/Resources/
    keywords:
      - prefab
      - panel
      - LuaBehaviour
      - scriptName
      - binding
      - controller
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_script_layer_lua_embedding_q5
  question: Unity C# 脚本层向 Lua 注入配置、资源、事件或网络服务的入口在哪里，注入协议是什么？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Lua/
    keywords:
      - inject
      - service
      - event
      - network
      - config
      - global
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_script_layer_lua_embedding_q6
  question: Lua 层如果要驱动协程、异步任务或定时器，是通过 C# 包装、xLua 协程桥还是自定义调度器完成的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Lua/
    keywords:
      - coroutine
      - StartCoroutine
      - IEnumerator
      - timer
      - async
      - scheduler
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_script_layer_lua_embedding_q7
  question: Lua 脚本需要访问 Unity 组件、ScriptableObject 或自定义 C# 类型时，白名单、代码生成或适配层写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Tools/
    keywords:
      - CSharpCallLua
      - LuaCallCSharp
      - GenConfig
      - wrap
      - binding
      - adapter
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_script_layer_lua_embedding_q8
  question: Lua 层订阅的 Unity 事件、委托、按钮回调或资源句柄在对象销毁时如何跟随脚本层一起清理？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Lua/
    keywords:
      - Dispose
      - RemoveListener
      - Unregister
      - OnDestroy
      - Release
      - delegate
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_script_layer_lua_embedding_q9
  question: Lua 模块源码在 Unity 工程内是以 TextAsset、bytes、明文目录还是自定义加密格式参与脚本层加载的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Assets/Resources/
      - Assets/StreamingAssets/
      - Packages/
    keywords:
      - TextAsset
      - bytes
      - require
      - AddLoader
      - decrypt
      - Lua
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_script_layer_lua_embedding_q10
  question: 编辑器下用于调试 Lua 脚本层的入口在哪里，是否集成了断点、堆栈、性能采样或模拟宿主？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Assets/
      - Packages/
      - Lua/
    keywords:
      - debug
      - profiler
      - EmmyLua
      - breakpoint
      - LuaDebugger
      - mock
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

  - `LuaComponent`
  - `DoString`
  - `require`
  - `CSharpCallLua`
  - `LuaCallCSharp`
  - `AddLoader`
  - `TextAsset`
