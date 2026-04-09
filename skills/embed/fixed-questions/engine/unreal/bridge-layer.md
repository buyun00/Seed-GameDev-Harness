---
name: fixed-questions-engine-unreal-bridge-layer
description: unreal / 桥接层 固定问题模板
matrix_id: engine.unreal.bridge_layer
axis: engine
engine: unreal
direction_id: bridge_layer
owner: researcher-unreal
question_set_id: qs-unreal-bridge-layer
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unreal.bridge_layer 的固定问题模板。
- 补充该引擎与脚本层、插件或宿主桥接边界上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: unreal_bridge_layer_q1
  question: 原生 C++ 向 Blueprint 暴露能力的主通道是什么，哪些类或函数大量使用了 `BlueprintCallable / BlueprintPure / BlueprintType`？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Plugins/**/*.h"
    keywords:
      - "BlueprintCallable"
      - "BlueprintPure"
      - "BlueprintType"
      - "Blueprintable"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_bridge_layer_q2
  question: Blueprint 回调原生系统的主要桥接点在哪里，是否通过 `BlueprintImplementableEvent` 或 `BlueprintNativeEvent` 让蓝图补实现？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "BlueprintImplementableEvent"
      - "BlueprintNativeEvent"
      - "_Implementation"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_bridge_layer_q3
  question: 蓝图层调用原生系统时，主要通过 `BlueprintFunctionLibrary`、`Subsystem`、`UObject` facade 还是组件桥接？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "UBlueprintFunctionLibrary"
      - "Subsystem"
      - "UObject"
      - "UActorComponent"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_bridge_layer_q4
  question: C++ 与 Blueprint 间的事件回传是否主要依赖 `DECLARE_DYNAMIC_MULTICAST_DELEGATE`、`BlueprintAssignable` 或 Event Dispatcher？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Content/**/BP_*"
    keywords:
      - "DECLARE_DYNAMIC_MULTICAST_DELEGATE"
      - "BlueprintAssignable"
      - "Event Dispatcher"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_bridge_layer_q5
  question: 异步能力是否通过 `UBlueprintAsyncActionBase`、`Latent` 节点或代理对象暴露给 Blueprint？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Plugins/**/*.h"
    keywords:
      - "UBlueprintAsyncActionBase"
      - "BlueprintInternalUseOnly"
      - "FLatentActionInfo"
      - "Activate()"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_bridge_layer_q6
  question: 平台 SDK、第三方服务或在线能力是如何封装成 Unreal 桥接层的，入口位于项目模块还是插件模块？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Plugins/"
      - "Source/**/*.Build.cs"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "ThirdParty"
      - "PublicDelayLoadDLLs"
      - "BlueprintCallable"
      - "Subsystem"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_bridge_layer_q7
  question: 桥接层的数据转换是否统一通过 `USTRUCT`、`UENUM`、`UObject` wrapper 或 `TSubclassOf` 暴露给 Blueprint？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Plugins/**/*.h"
    keywords:
      - "USTRUCT(BlueprintType)"
      - "UENUM(BlueprintType)"
      - "UPROPERTY(BlueprintReadOnly)"
      - "TSubclassOf"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_bridge_layer_q8
  question: 是否存在自定义 K2 节点、Editor-only 桥接工具或 Blueprint 节点扩展，用于把复杂原生能力封成可视化节点？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*K2Node*"
      - "Plugins/**/*K2Node*"
      - "Source/**/*Editor*"
    keywords:
      - "UK2Node"
      - "BlueprintGraph"
      - "ExpandNode"
      - "AllocateDefaultPins"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_bridge_layer_q9
  question: 跨模块桥接是否有统一导出边界，例如 API 宏、公共接口头和 facade 类的组织规则？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/Public/"
      - "Source/**/Private/"
      - "Source/**/*.Build.cs"
    keywords:
      - "_API"
      - "PublicDependencyModuleNames"
      - "PrivateDependencyModuleNames"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_bridge_layer_q10
  question: 项目是否明确区分“可供 Blueprint 使用的稳定桥接 API”和“仅原生内部可用实现”，边界规则在哪里体现？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Plugins/**/*.h"
    keywords:
      - "BlueprintCallable"
      - "BlueprintAuthorityOnly"
      - "BlueprintCosmetic"
      - "meta ="
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
