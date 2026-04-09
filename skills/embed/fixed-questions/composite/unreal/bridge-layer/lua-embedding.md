---
name: fixed-questions-composite-unreal-bridge-layer-lua-embedding
description: unreal / bridge-layer x lua-embedding 交叉固定问题模板
composite_id: composite.unreal.bridge_layer.lua_embedding
axis: composite
engine: unreal
direction_id: bridge_layer
capability: lua_embedding
capability_id: lua_embedding
owner: builder-unreal
researcher_owner: researcher-unreal
capability_owner: researcher-lua
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.unreal.bridge_layer.lua_embedding` 的交叉固定问题模板。
- 只补充 `engine.unreal.bridge_layer` 与 `capability.lua_embedding` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/unreal/bridge-layer.md` 与 `fixed-questions/capability/lua-embedding.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。

## 交叉固定问题

- id: unreal_bridge_layer_lua_embedding_q1
  question: 项目实际使用的是哪套 Unreal Lua 方案，例如 `UnLua`、`slua-unreal` 或自研桥，插件和主入口模块在哪里？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - "Plugins/"
      - "Source/"
      - "*.uproject"
      - "*.uplugin"
      - "Content/Script/"
    keywords:
      - "UnLua"
      - "slua"
      - "LuaMachine"
      - "LuaState"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_bridge_layer_lua_embedding_q2
  question: Lua 与 Unreal 的桥接主通道是基于 Blueprint 反射、静态导出、代码生成，还是多种方式混用？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Plugins/"
      - "Source/**/*Lua*"
      - "Source/**/*Export*"
      - "Source/**/*Binding*"
      - "Tools/"
    keywords:
      - "Reflection"
      - "CppBinding"
      - "Export"
      - "CodeGen"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_bridge_layer_lua_embedding_q3
  question: 哪些 `UCLASS/UFUNCTION/USTRUCT/UENUM` 被稳定暴露给 Lua，暴露名单是自动扫描还是人工维护？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Plugins/**/*.h"
      - "Source/**/*Lua*"
      - "Plugins/**/*Lua*"
    keywords:
      - "UCLASS"
      - "UFUNCTION"
      - "USTRUCT"
      - "UENUM"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_bridge_layer_lua_embedding_q4
  question: Blueprint 到 Lua 的回调桥是否依赖 `BlueprintEvent`、`BlueprintImplementableEvent`、delegate 绑定或插件自定义节点？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*Lua*"
      - "Plugins/**/*Lua*"
      - "Content/**/BP_*"
    keywords:
      - "BlueprintImplementableEvent"
      - "BlueprintNativeEvent"
      - "BlueprintEvent"
      - "ProcessEvent"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_bridge_layer_lua_embedding_q5
  question: Lua 到 Blueprint/C++ 的调用是否经过统一 facade、`FunctionLibrary`、`Subsystem` 或代理对象，入口命名是否稳定？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Lua*"
      - "Source/**/*Subsystem*"
      - "Source/**/*FunctionLibrary*"
      - "Plugins/**/*Lua*"
    keywords:
      - "UBlueprintFunctionLibrary"
      - "Subsystem"
      - "CallLua"
      - "LuaCall"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_bridge_layer_lua_embedding_q6
  question: RPC、`RepNotify`、`InputEvent`、`AnimNotify` 等 Unreal 事件是否允许被 Lua 覆写，覆写路径和限制条件在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Lua*"
      - "Plugins/**/*Lua*"
      - "Source/**/*.h"
      - "Content/**/BP_*"
    keywords:
      - "RepNotify"
      - "InputEvent"
      - "AnimNotify"
      - "Override"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_bridge_layer_lua_embedding_q7
  question: UObject、Actor、Component、容器和结构体在 Lua 边界上的生命周期与所有权如何约束，是否有显式 wrapper 或 pin 策略？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Lua*"
      - "Plugins/**/*Lua*"
      - "Source/**/*.cpp"
      - "Plugins/**/*.cpp"
    keywords:
      - "GC"
      - "Reference"
      - "Wrapper"
      - "WeakObjectPtr"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_bridge_layer_lua_embedding_q8
  question: 是否存在“反射可自动导出”和“必须手工补桥”的两类接口，后者通常如何登记和维护？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Lua*"
      - "Plugins/**/*Lua*"
      - "Source/**/*Binding*"
      - "Tools/"
    keywords:
      - "BEGIN_EXPORT"
      - "ADD_FUNCTION"
      - "Manual"
      - "Binding"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_bridge_layer_lua_embedding_q9
  question: Lua 回调绑定到 delegate 或 Blueprint Dispatcher 时，解绑、弱引用与销毁回收是如何处理的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Lua*"
      - "Plugins/**/*Lua*"
      - "Source/**/*.cpp"
      - "Content/**/BP_*"
    keywords:
      - "AddDynamic"
      - "RemoveDynamic"
      - "Unbind"
      - "MulticastDelegate"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_bridge_layer_lua_embedding_q10
  question: 项目是否采用多 `LuaState`、多运行域或客户端/服务端隔离环境，它们与 Unreal 模块边界如何对应？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Lua*"
      - "Plugins/**/*Lua*"
      - "Config/"
      - "Content/Script/"
    keywords:
      - "LuaState"
      - "MultiState"
      - "Server"
      - "Client"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
