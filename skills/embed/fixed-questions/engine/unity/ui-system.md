---
name: fixed-questions-engine-unity-ui-system
description: unity / UI 系统 固定问题模板
matrix_id: engine.unity.ui_system
axis: engine
engine: unity
direction_id: ui_system
owner: researcher-unity
question_set_id: qs-unity-ui-system
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unity.ui_system 的固定问题模板。
- 补充该引擎 UI 栈、界面组织与交互主路径上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 taxonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: unity_ui_system_q1
  question: 项目的主 UI 技术栈是什么，使用 uGUI、UI Toolkit、TextMeshPro、FairyGUI 还是其他第三方方案？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Packages/manifest.json
    keywords:
      - UnityEngine.UI
      - UI Toolkit
      - UIDocument
      - TMPro
      - FairyGUI
      - NGUI
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_ui_system_q2
  question: UI Root 的创建入口在哪里，是 Canvas、UIDocument、独立场景还是常驻管理器负责初始化？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - Canvas
      - CanvasScaler
      - UIDocument
      - UIRoot
      - EventSystem
      - DontDestroyOnLoad
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_ui_system_q3
  question: 页面、窗口、弹窗和 HUD 是如何组织的，是否存在统一的 UIManager / WindowManager？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - UIManager
      - WindowManager
      - Panel
      - Popup
      - HUD
      - OpenUI
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_ui_system_q4
  question: UI 资源放在哪里，使用的是 Prefab、SpriteAtlas、UXML / USS，还是运行时动态拼装？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - Prefab
      - SpriteAtlas
      - UXML
      - USS
      - VisualTreeAsset
      - UI prefab
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_ui_system_q5
  question: UI 输入和交互事件由谁处理，使用的是 EventSystem、Input System、UI Toolkit 回调还是自定义分发？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - EventSystem
      - InputSystemUIInputModule
      - StandaloneInputModule
      - RegisterCallback
      - Button.onClick
      - pointer
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_ui_system_q6
  question: UI 数据刷新采用什么模式，是手动 SetText / SetActive、Presenter 绑定、MVVM 还是 ScriptableObject channel？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - SetText
      - text =
      - Bind
      - Presenter
      - ViewModel
      - NotifyValueChanged
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_ui_system_q7
  question: UI 页面是否支持异步加载、对象池复用或 Addressables 动态实例化，入口在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/AddressableAssetsData/
    keywords:
      - Addressables
      - InstantiateAsync
      - AssetReferenceGameObject
      - Pool
      - preload
      - UI prefab
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_ui_system_q8
  question: UI 的分辨率适配、安全区、横竖屏和多设备布局策略写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - CanvasScaler
      - referenceResolution
      - safeArea
      - Screen.orientation
      - resolution
      - device layout
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_ui_system_q9
  question: 文本、字体、图集和本地化在 UI 系统中是怎么组织和替换的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - TMP_FontAsset
      - TextMeshProUGUI
      - Localization
      - font
      - sprite atlas
      - localize
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_ui_system_q10
  question: 界面过场、弹窗动画、点击反馈和 UI 特效使用什么实现，和动画系统的边界在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - DOTween
      - Animator
      - CanvasGroup
      - tween
      - transition
      - UI animation
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

