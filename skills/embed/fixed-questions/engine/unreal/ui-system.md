---
name: fixed-questions-engine-unreal-ui-system
description: unreal / UI 系统 固定问题模板
matrix_id: engine.unreal.ui_system
axis: engine
engine: unreal
direction_id: ui_system
owner: researcher-unreal
question_set_id: qs-unreal-ui-system
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unreal.ui_system 的固定问题模板。
- 补充该引擎 UI 栈、界面组织与交互主路径上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: unreal_ui_system_q1
  question: 项目的主 UI 栈是 `UMG`、`Slate`、`CommonUI` 还是多套并存，主入口证据在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "*.uproject"
      - "Source/**/*.Build.cs"
      - "Source/**/*.h"
      - "Content/UI/"
    keywords:
      - "UMG"
      - "Slate"
      - "CommonUI"
      - "CommonInput"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_ui_system_q2
  question: 顶层 UI 是从 `HUD`、`PlayerController`、`GameInstance` 还是 `GameViewportSubsystem` 挂到视口上的？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Source/**/*.h"
    keywords:
      - "CreateWidget"
      - "AddToViewport"
      - "AHUD"
      - "UGameViewportSubsystem"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_ui_system_q3
  question: 是否存在统一的 `UUserWidget` 基类、Widget 命名规范或 UI 模块，作为 UI 系统主边界？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Content/**/WBP_*"
    keywords:
      - "UUserWidget"
      - "WBP_"
      - "Widget"
      - "UI"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_ui_system_q4
  question: 输入路由和界面导航是否通过 `CommonUI / CommonInput / Enhanced Input` 统一管理？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "*.uproject"
      - "Source/**/*.Build.cs"
      - "Source/**/*.h"
      - "Config/*.ini"
    keywords:
      - "CommonUI"
      - "CommonInput"
      - "EnhancedInput"
      - "InputAction"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_ui_system_q5
  question: UI 层级、页面栈和弹窗管理是否由专门的 UI Manager、Subsystem 或根 Widget 管理？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*UI*"
      - "Source/**/*Widget*"
      - "Source/**/*Subsystem*"
    keywords:
      - "UIManager"
      - "Layer"
      - "Stack"
      - "Subsystem"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_ui_system_q6
  question: UI 数据绑定是依赖 UMG 直接绑定、MVVM、字段通知还是手写刷新函数？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "*.uproject"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Content/**/WBP_*"
    keywords:
      - "MVVM"
      - "FieldNotify"
      - "BindWidget"
      - "BindWidgetOptional"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_ui_system_q7
  question: 世界空间 UI、血条或交互提示是否通过 `WidgetComponent` 或自定义 3D UI 方案接入？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Content/**/WBP_*"
    keywords:
      - "UWidgetComponent"
      - "Space = EWidgetSpace"
      - "WidgetClass"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_ui_system_q8
  question: 是否存在 `Slate` 自定义控件、Editor UI 或工具面板，说明项目不只是纯 UMG？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Plugins/**/*.h"
      - "Plugins/**/*.cpp"
    keywords:
      - "SCompoundWidget"
      - "SLATE_BEGIN_ARGS"
      - "FSlateStyleSet"
      - "RegisterNomadTabSpawner"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_ui_system_q9
  question: UI 动画主要使用 UMG Animation、Timeline、Sequencer 还是自定义过渡系统？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Content/**/WBP_*"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "PlayAnimation"
      - "BindToAnimationFinished"
      - "WidgetAnimation"
      - "LevelSequence"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_ui_system_q10
  question: UI 是否显式处理多分辨率、设备安全区、本地化或平台差异化皮肤样式？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/*.ini"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Content/UI/"
    keywords:
      - "SafeZone"
      - "Localization"
      - "Culture"
      - "DPIScale"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
