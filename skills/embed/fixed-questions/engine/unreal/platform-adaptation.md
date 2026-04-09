---
name: fixed-questions-engine-unreal-platform-adaptation
description: unreal / 平台适配 固定问题模板
matrix_id: engine.unreal.platform_adaptation
axis: engine
engine: unreal
direction_id: platform_adaptation
owner: researcher-unreal
question_set_id: qs-unreal-platform-adaptation
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unreal.platform_adaptation 的固定问题模板。
- 补充该引擎平台目标、导出链路和平台桥接上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: unreal_platform_adaptation_q1
  question: 项目支持哪些目标平台，相关证据主要来自 `*.Target.cs`、`Build.cs`、`.uproject` 还是打包脚本？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.Target.cs"
      - "Source/**/*.Build.cs"
      - "*.uproject"
      - "*.bat"
    keywords:
      - "Target.Platform"
      - "SupportedTargetPlatforms"
      - "UnrealTargetPlatform"
      - "RunUAT"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_platform_adaptation_q2
  question: 是否存在平台专属配置、设备档位或运行时参数，例如 `Config/<Platform>`、`DeviceProfiles`、可伸缩性配置？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/"
      - "Config/**/Default*.ini"
      - "Config/DefaultDeviceProfiles.ini"
      - "Config/DefaultScalability.ini"
    keywords:
      - "DeviceProfiles"
      - "Scalability"
      - "Android"
      - "IOS"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_platform_adaptation_q3
  question: 平台 SDK、在线服务或商店能力是通过哪些插件或模块接入的，分别面向哪些平台？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "*.uproject"
      - "Plugins/**/*.uplugin"
      - "Source/**/*.Build.cs"
    keywords:
      - "OnlineSubsystem"
      - "Steam"
      - "Android"
      - "IOS"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_platform_adaptation_q4
  question: 代码中是否存在显式的平台条件分支，如 `#if PLATFORM_WINDOWS / PLATFORM_ANDROID / PLATFORM_IOS`？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Plugins/**/*.h"
      - "Plugins/**/*.cpp"
    keywords:
      - "PLATFORM_WINDOWS"
      - "PLATFORM_ANDROID"
      - "PLATFORM_IOS"
      - "PLATFORM_PS"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_platform_adaptation_q5
  question: 输入、UI 和交互是否对移动端、PC、主机做了显式差异化适配？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/*.ini"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Content/UI/"
    keywords:
      - "EnhancedInput"
      - "CommonInput"
      - "Touch"
      - "Gamepad"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_platform_adaptation_q6
  question: 打包、Cook、Staging 或发布流程是否按平台拆分，哪些脚本或配置体现了差异？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "*.bat"
      - "*.ps1"
      - "*.md"
      - "Config/*.ini"
    keywords:
      - "RunUAT"
      - "Cook"
      - "Stage"
      - "Package"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_platform_adaptation_q7
  question: 登录、成就、云存档、支付或联网服务是否通过平台特有 `OnlineSubsystem` / SDK 做了分层适配？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Plugins/**/*.h"
      - "Plugins/**/*.cpp"
    keywords:
      - "OnlineSubsystem"
      - "IdentityInterface"
      - "Achievements"
      - "InAppPurchase"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_platform_adaptation_q8
  question: 文件系统、保存路径、权限申请或本地缓存是否针对平台差异做了专门处理？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Plugins/**/*.cpp"
    keywords:
      - "FPaths"
      - "ProjectSavedDir"
      - "Permission"
      - "ExternalFilesDir"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_platform_adaptation_q9
  question: 是否存在按平台裁剪的资源、地图、插件或 Chunk，避免所有平台共用同一套内容？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/*.ini"
      - "Plugins/**/*.uplugin"
      - "Content/"
    keywords:
      - "ChunkId"
      - "PrimaryAssetLabel"
      - "WhitelistPlatforms"
      - "PlatformAllowList"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_platform_adaptation_q10
  question: 渲染、性能和画质是否有面向平台的差异化设置，例如移动端、主机或高端 PC 分档？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/DefaultEngine.ini"
      - "Config/DefaultScalability.ini"
      - "Config/DefaultDeviceProfiles.ini"
      - "Source/**/*.cpp"
    keywords:
      - "r."
      - "sg."
      - "DeviceProfile"
      - "Scalability"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
