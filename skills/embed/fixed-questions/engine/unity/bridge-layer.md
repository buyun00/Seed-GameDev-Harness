---
name: fixed-questions-engine-unity-bridge-layer
description: unity / 桥接层 固定问题模板
matrix_id: engine.unity.bridge_layer
axis: engine
engine: unity
direction_id: bridge_layer
owner: researcher-unity
question_set_id: qs-unity-bridge-layer
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unity.bridge_layer 的固定问题模板。
- 补充该引擎与脚本层、插件或宿主桥接边界上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 taxonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: unity_bridge_layer_q1
  question: Unity C# 层与原生 SDK、平台宿主或外部进程之间的主桥接入口在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Plugins/
      - Assets/
      - Packages/
    keywords:
      - DllImport
      - AndroidJavaObject
      - AndroidJavaClass
      - UnitySendMessage
      - native
      - bridge
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_bridge_layer_q2
  question: Android 侧桥接封装放在哪里，是通过 AndroidJavaObject、AAR、JNI wrapper 还是自定义 SDK facade 接入的？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Plugins/Android/
      - Assets/
      - Packages/
    keywords:
      - AndroidJavaObject
      - AndroidJavaClass
      - currentActivity
      - AAR
      - JNI
      - AndroidManifest
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_bridge_layer_q3
  question: iOS / macOS 原生桥接是否通过 __Internal、Objective-C / Swift wrapper 或 PostProcessBuild 扩展接入，代码放在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Plugins/iOS/
      - Assets/
      - Packages/
    keywords:
      - "__Internal"
      - DllImport
      - ObjectiveC
      - Swift
      - PostProcessBuild
      - plist
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_bridge_layer_q4
  question: 原生层回调 Unity 的主路径是什么，是 UnitySendMessage、委托回调、消息队列还是轮询拉取？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Assets/Plugins/
      - Packages/
    keywords:
      - UnitySendMessage
      - callback
      - Action
      - delegate
      - event
      - queue
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_bridge_layer_q5
  question: 桥接层是否通过接口、Facade、Service 或平台适配器隔离调用方，编辑器和真机实现如何切换？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - interface
      - Facade
      - Service
      - Adapter
      - mock
      - UNITY_EDITOR
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_bridge_layer_q6
  question: 跨桥接边界传递的数据格式是什么，使用 JSON、字符串协议、二进制结构体还是 ScriptableObject 映射？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/Plugins/
    keywords:
      - JsonUtility
      - Newtonsoft
      - Marshal
      - byte[]
      - protobuf
      - message
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_bridge_layer_q7
  question: 登录、支付、推送、广告或分享等平台能力的初始化、登录态和生命周期由哪个桥接管理器负责？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/Plugins/
    keywords:
      - Initialize
      - Login
      - Payment
      - Push
      - Ads
      - SDKManager
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_bridge_layer_q8
  question: 插件导入设置、平台过滤、CPU 架构或 Editor / Runtime 区分是否通过 PluginImporter 或目录约定配置？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Plugins/
      - Assets/Editor/
      - Packages/
    keywords:
      - PluginImporter
      - SetCompatibleWithPlatform
      - Any Platform
      - CPU
      - Editor
      - plugin
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_bridge_layer_q9
  question: 除移动端外，项目是否还桥接了 WebView、桌面 DLL、小游戏容器或其他宿主环境，边界代码在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Plugins/
      - Assets/
      - Packages/
    keywords:
      - WebView
      - dll
      - browser
      - mini game
      - host
      - wrapper
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_bridge_layer_q10
  question: 桥接层的错误处理、重试、日志上报或超时保护是怎么做的，关键代码入口在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Assets/Plugins/
      - Packages/
    keywords:
      - try
      - catch
      - timeout
      - retry
      - log
      - errorCode
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

