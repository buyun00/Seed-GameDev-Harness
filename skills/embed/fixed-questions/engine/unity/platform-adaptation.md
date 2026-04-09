---
name: fixed-questions-engine-unity-platform-adaptation
description: unity / 平台适配 固定问题模板
matrix_id: engine.unity.platform_adaptation
axis: engine
engine: unity
direction_id: platform_adaptation
owner: researcher-unity
question_set_id: qs-unity-platform-adaptation
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unity.platform_adaptation 的固定问题模板。
- 补充该引擎平台目标、导出链路和平台桥接上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 taxonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: unity_platform_adaptation_q1
  question: 项目通过哪些平台宏、目录约定或 facade 实现平台差异化，关键入口在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - "#if UNITY_"
      - UNITY_ANDROID
      - UNITY_IOS
      - UNITY_STANDALONE
      - platform
      - facade
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_platform_adaptation_q2
  question: 目标平台、Scripting Backend、IL2CPP / Mono、包名、图标和启动配置主要在哪里设置？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - ProjectSettings/
      - Assets/Editor/
      - Packages/
    keywords:
      - PlayerSettings
      - BuildTarget
      - IL2CPP
      - packageName
      - bundleVersion
      - scriptingBackend
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_platform_adaptation_q3
  question: Android 导出链路在哪里，是否修改了 Gradle、AndroidManifest、AAR、Proguard 或自定义构建脚本？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Plugins/Android/
      - Assets/Editor/
      - Packages/
    keywords:
      - mainTemplate.gradle
      - AndroidManifest.xml
      - launcherTemplate.gradle
      - AAR
      - Proguard
      - AndroidResolver
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_platform_adaptation_q4
  question: iOS 导出链路在哪里，是否通过 plist、framework、PBXProject 或 PostProcessBuild 做定制？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Plugins/iOS/
      - Assets/Editor/
      - Packages/
    keywords:
      - PostProcessBuild
      - PBXProject
      - plist
      - framework
      - entitlements
      - Xcode
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_platform_adaptation_q5
  question: 除 Android / iOS 外，项目是否还适配了 WebGL、PC、主机、小游戏平台或特定宿主，边界目录在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - ProjectSettings/
    keywords:
      - WebGL
      - Standalone
      - console
      - mini game
      - platform
      - build target
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_platform_adaptation_q6
  question: 权限申请、系统能力和设备特性适配写在哪里，例如相机、定位、通知、后台唤起或隐私弹窗？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Plugins/
      - Assets/
      - Packages/
    keywords:
      - permission
      - camera
      - notification
      - location
      - privacy
      - authorize
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_platform_adaptation_q7
  question: 分辨率、刘海屏、安全区、输入方式和性能档位适配逻辑放在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - safeArea
      - Screen.dpi
      - resolution
      - QualitySettings
      - Input
      - device
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_platform_adaptation_q8
  question: 登录、支付、分享、广告、推送等平台服务是否通过统一接口适配，不同平台实现分别在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/Plugins/
    keywords:
      - Login
      - Payment
      - Share
      - Ads
      - Push
      - platform service
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_platform_adaptation_q9
  question: 配置、资源、文案或 UI 是否根据平台切换，切换规则和资源入口在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - platform config
      - variant
      - Addressables
      - label
      - safe area
      - localized
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_platform_adaptation_q10
  question: 平台导出后的后处理、签名、注入文件或 CI 构建脚本在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Tools/
      - Packages/
    keywords:
      - BuildPipeline
      - PostProcessBuild
      - signing
      - keystore
      - xcodebuild
      - gradle
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

