---
name: fixed-questions-engine-cocos-ui-system
description: cocos / UI 系统 固定问题模板
matrix_id: engine.cocos.ui_system
axis: engine
engine: cocos
direction_id: ui_system
owner: researcher-cocos
question_set_id: qs-cocos-ui-system
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.cocos.ui_system 的固定问题模板。
- 补充该引擎 UI 组织、窗口管理、适配与交互实现上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: cocos_ui_system_q1
  question: 项目的 UI 根节点、Canvas 分层和常驻 UI 容器是如何组织的，入口脚本在哪里？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - assets/scenes/
      - assets/ui/
      - assets/prefabs/
    keywords:
      - Canvas
      - UIRoot
      - UILayer
      - uiManager
      - camera
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_ui_system_q2
  question: 窗口、面板、弹窗和 HUD 是否由统一的 UIManager 或 WindowManager 管理，打开关闭链路是什么？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/ui/
      - assets/scripts/
      - assets/prefabs/
    keywords:
      - UIManager
      - WindowManager
      - open
      - close
      - popup
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_ui_system_q3
  question: UI 资源是场景内直挂、Prefab 动态加载还是 bundle 分包加载，释放策略由谁负责？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/ui/
      - assets/prefabs/
      - assets/bundles/
    keywords:
      - Prefab
      - load
      - instantiate
      - bundle
      - release
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_ui_system_q4
  question: 屏幕适配是否主要依赖 Canvas、Widget、Layout、SafeArea 或自定义适配脚本，适配逻辑集中在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/ui/
      - assets/scenes/
      - assets/scripts/
    keywords:
      - Widget
      - Layout
      - SafeArea
      - fitHeight
      - fitWidth
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_ui_system_q5
  question: UI 事件绑定是否通过 Button、Toggle、Node.on 还是统一事件转发层完成，解绑点是否清晰？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/ui/
      - assets/scripts/
    keywords:
      - Button
      - Toggle
      - node.on
      - clickEvents
      - off(
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_ui_system_q6
  question: UI 数据刷新是直接 set string / sprite，还是经过 view model、binder、observer 等中间层？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/ui/
      - assets/scripts/
    keywords:
      - updateView
      - bind
      - observe
      - refresh
      - model
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_ui_system_q7
  question: 弹窗堆栈、遮罩、返回键关闭和多窗口互斥是否有统一规则，规则在哪里实现？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/ui/
      - assets/scripts/
    keywords:
      - stack
      - modal
      - mask
      - back
      - topMost
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_ui_system_q8
  question: 长列表、复用列表和高频刷新 UI 是否使用对象池、虚拟列表或局部刷新优化？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/ui/
      - assets/prefabs/
      - assets/scripts/
    keywords:
      - ScrollView
      - ListView
      - virtual
      - pool
      - reuse
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_ui_system_q9
  question: UI 动效、过场和点击反馈主要是通过 Tween、Animation 还是 Spine 驱动，封装是否统一？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/ui/
      - assets/animation/
      - assets/effects/
    keywords:
      - Tween
      - Animation
      - spine
      - transition
      - effect
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_ui_system_q10
  question: 多语言、主题换肤、分辨率差异和平台专属 UI 是否在 UI 框架中有统一扩展位？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/ui/
      - assets/i18n/
      - assets/theme/
    keywords:
      - i18n
      - locale
      - skin
      - theme
      - platform
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
