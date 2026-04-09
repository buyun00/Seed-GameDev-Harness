---
name: fixed-questions-engine-cocos-native-code-architecture
description: cocos / 原生代码架构 固定问题模板
matrix_id: engine.cocos.native_code_architecture
axis: engine
engine: cocos
direction_id: native_code_architecture
owner: researcher-cocos
question_set_id: qs-cocos-native-code-architecture
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.cocos.native_code_architecture 的固定问题模板。
- 补充该引擎原生工程结构、C++ 代码组织和平台工程接入方式上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: cocos_native_code_architecture_q1
  question: 项目是否真正接入了原生工程，原生代码主目录、入口工程和平台工程分别位于哪里？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - native/
      - build/
      - proj/
      - frameworks/
    keywords:
      - AppDelegate
      - main.cpp
      - CMakeLists
      - proj.android
      - proj.ios
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_native_code_architecture_q2
  question: C++ 原生模块是如何组织的，哪些目录承载了自研引擎扩展、SDK wrapper 或平台适配代码？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - native/
      - native/engine/
      - native/cocos/
      - frameworks/runtime-src/
    keywords:
      - cpp
      - sdk
      - wrapper
      - module
      - adapter
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_native_code_architecture_q3
  question: JSB 绑定、反射调用或手工 binding 代码落在哪些文件，脚本与 C++ 的接口边界如何定义？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - native/
      - assets/
      - extensions/
    keywords:
      - sebind
      - jsb
      - binding
      - reflection
      - ScriptEngine
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_native_code_architecture_q4
  question: 原生启动顺序和脚本启动顺序如何衔接，初始化链路中有哪些自定义插桩？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - native/
      - assets/
    keywords:
      - AppDelegate
      - applicationDidFinishLaunching
      - init
      - start
      - ScriptEngine::start
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_native_code_architecture_q5
  question: Android、iOS、macOS 或 Windows 的平台差异代码是共用一层抽象还是分别维护独立实现？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - native/
      - proj.android/
      - proj.ios_mac/
      - proj.win32/
    keywords:
      - android
      - ios
      - mac
      - win32
      - platform
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_native_code_architecture_q6
  question: 原生构建系统使用 CMake、Gradle、Xcode 工程模板还是自定义脚本增强，关键改动点在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - native/
      - build-templates/
      - proj.android/
      - proj.ios_mac/
    keywords:
      - CMakeLists.txt
      - build.gradle
      - Podfile
      - xcodeproj
      - template
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_native_code_architecture_q7
  question: 原生侧日志、崩溃、异常和脚本报错是如何汇总上报的，是否存在统一日志桥？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - native/
      - assets/
      - sdk/
    keywords:
      - crash
      - exception
      - logger
      - report
      - analytics
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_native_code_architecture_q8
  question: 文件系统、资源路径和沙盒路径在原生侧是否有统一封装，脚本层如何感知这些路径差异？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - native/
      - assets/
    keywords:
      - fileUtils
      - writablePath
      - cachePath
      - resource path
      - sandbox
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_native_code_architecture_q9
  question: 是否存在需要在原生线程执行的耗时任务，任务结果回主线程或脚本层的机制是什么？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - native/
      - assets/
    keywords:
      - thread
      - async
      - scheduler
      - dispatch
      - callback
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_native_code_architecture_q10
  question: 原生代码升级、引擎版本变更或第三方 SDK 更新时，仓库里是否保留了本地 patch、说明文档或定制分叉痕迹？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - native/
      - docs/
      - patches/
      - third-party/
    keywords:
      - patch
      - fork
      - custom engine
      - upgrade
      - changelog
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
