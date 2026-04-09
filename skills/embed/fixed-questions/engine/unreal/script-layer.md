---
name: fixed-questions-engine-unreal-script-layer
description: unreal / 脚本层 固定问题模板
matrix_id: engine.unreal.script_layer
axis: engine
engine: unreal
direction_id: script_layer
owner: researcher-unreal
question_set_id: qs-unreal-script-layer
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unreal.script_layer 的固定问题模板。
- 补充该引擎在脚本层组织、职责边界和宿主关系上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 	axonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: unreal_script_layer_q1
  question: 项目是否把 Blueprint 作为主要脚本层，核心 Blueprint 资源主要集中在哪些目录和命名规则下？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Content/**/BP_*"
      - "Content/**/WBP_*"
      - "Content/**/ABP_*"
    keywords:
      - "BP_"
      - "WBP_"
      - "ABP_"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_script_layer_q2
  question: 主要 Blueprint 是否都继承自自定义 C++ 基类，蓝图脚本层和原生层的父子边界在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Content/**/BP_*"
    keywords:
      - "Blueprintable"
      - "BlueprintType"
      - "TSubclassOf"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_script_layer_q3
  question: Blueprint 是否主要承担 UI、动画编排、关卡编排，还是承载了大量核心 gameplay 逻辑？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Content/**/BP_*"
      - "Content/**/WBP_*"
      - "Content/Maps/"
      - "Source/**/*.h"
    keywords:
      - "ReceiveBeginPlay"
      - "BlueprintImplementableEvent"
      - "WidgetBlueprint"
      - "LevelScriptActor"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_script_layer_q4
  question: 是否存在 `BlueprintFunctionLibrary` 作为公共脚本 API 层，集中向蓝图暴露工具函数？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*BlueprintFunctionLibrary*.h"
      - "Source/**/*BlueprintFunctionLibrary*.cpp"
      - "Source/**/*.h"
    keywords:
      - "UBlueprintFunctionLibrary"
      - "BlueprintCallable"
      - "BlueprintPure"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_script_layer_q5
  question: Blueprint 接口是否被大量用于系统解耦，哪些 `UINTERFACE` / `BlueprintNativeEvent` / `BlueprintImplementableEvent` 是脚本层主通道？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "UINTERFACE"
      - "BlueprintNativeEvent"
      - "BlueprintImplementableEvent"
      - "Execute_"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_script_layer_q6
  question: 是否存在大量 data-only Blueprint，用于给 C++ 基类配置默认值、资源引用和组件组合？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Content/**/BP_*"
      - "Content/**/DA_*"
      - "Source/**/*.h"
    keywords:
      - "EditDefaultsOnly"
      - "BlueprintReadOnly"
      - "TSubclassOf"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_script_layer_q7
  question: Blueprint 之间是否通过 `Event Dispatcher`、接口或 `Subsystem` 调用进行通信，而不是直接硬引用？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Content/**/BP_*"
      - "Content/**/WBP_*"
    keywords:
      - "BlueprintAssignable"
      - "Event Dispatcher"
      - "Blueprint Interface"
      - "Subsystem"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_script_layer_q8
  question: Level Blueprint、Widget Blueprint、Animation Blueprint 是否构成了三个不同职责的脚本层分工？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Content/Maps/"
      - "Content/**/WBP_*"
      - "Content/**/ABP_*"
    keywords:
      - "Level Blueprint"
      - "WidgetBlueprint"
      - "AnimBlueprint"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_script_layer_q9
  question: 是否存在 `Blueprint Macro Library`、Editor Utility Blueprint 或 Editor Utility Widget 作为额外脚本化工具层？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Content/**/BML_*"
      - "Content/**/EUW_*"
      - "Content/**/EUB_*"
      - "Source/**/*.h"
    keywords:
      - "Blueprint Macro Library"
      - "EditorUtilityWidget"
      - "EditorUtilityBlueprint"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_script_layer_q10
  question: 脚本层是否有明确边界规范，例如核心状态机留在 C++，Blueprint 只负责配置、编排或表现？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Config/*.ini"
      - "Content/**/BP_*"
    keywords:
      - "BlueprintCallable"
      - "BlueprintImplementableEvent"
      - "BlueprintReadOnly"
      - "BlueprintReadWrite"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
