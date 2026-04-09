---
name: fixed-questions-composite-unreal-hot-reload-build-release-and-cicd
description: unreal / hot-reload x build-release-and-cicd 交叉固定问题模板
composite_id: composite.unreal.hot_reload.build_release_and_cicd
axis: composite
engine: unreal
direction_id: hot_reload
capability: build_release_and_cicd
capability_id: build_release_and_cicd
owner: builder-unreal
researcher_owner: researcher-unreal
capability_owner: researcher-infra
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.unreal.hot_reload.build_release_and_cicd` 的交叉固定问题模板。
- 只补充 `engine.unreal.hot_reload` 与 `capability.build_release_and_cicd` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/unreal/hot-reload.md` 与 `fixed-questions/capability/build-release-and-cicd.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。

## 固定问题

- id: unreal_hot_reload_build_release_and_cicd_q1
  question: 团队当前默认使用的是 `Live Coding` 还是传统 `Hot Reload`，本地开发约定与正式 CI 约定是否刻意分离？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - "Config/"
      - "Build/"
      - "Scripts/"
      - "Docs/"
      - "README*"
    keywords:
      - "Live Coding"
      - "Hot Reload"
      - "Development Editor"
      - "CI"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_hot_reload_build_release_and_cicd_q2
  question: 流水线是否显式禁止把本地热重载或 Live Coding 生成的临时二进制带入提交、打包或发布工件？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Build/"
      - "Scripts/"
      - ".gitignore"
      - ".p4ignore"
      - "Docs/"
    keywords:
      - "Binaries"
      - "Intermediate"
      - "LiveCoding"
      - "HotReload"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_hot_reload_build_release_and_cicd_q3
  question: 项目是否为高频迭代模块配置了 `Live Coding` 预加载模块列表，哪些模块允许预加载，哪些明确不允许？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/"
      - "Config/DefaultEditorPerProjectUserSettings.ini"
      - "Source/**/*.Build.cs"
      - "Docs/"
    keywords:
      - "Preload"
      - "Live Coding"
      - "Modules"
      - "EditorPerProjectUserSettings"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_hot_reload_build_release_and_cicd_q4
  question: C++ 结构变更、UHT 生成代码变更或反射宏变更时，团队是否要求全量重编译而不是继续 Live Coding？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Docs/"
      - "README*"
      - "Build/"
      - "Scripts/"
      - "Source/**/*.h"
    keywords:
      - "UHT"
      - "Reflection"
      - "GENERATED_BODY"
      - "Full Rebuild"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_hot_reload_build_release_and_cicd_q5
  question: 对于 UObject reinstancing，项目是否在可重载模块中统一处理缓存失效、delegate 清理和指针重绑？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Source/**/*.h"
      - "Plugins/**/*.cpp"
      - "Plugins/**/*.h"
    keywords:
      - "ReloadReinstancingCompleteDelegate"
      - "ReloadCompleteDelegate"
      - "Reinstance"
      - "Delegate"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_hot_reload_build_release_and_cicd_q6
  question: 构建脚本是否提供 `clean build`、`module rebuild`、`editor build`、`game build` 的明确区分，避免本地增量状态污染 CI？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Build/"
      - "Scripts/"
      - ".github/workflows/"
      - "Jenkinsfile"
      - "Tools/"
    keywords:
      - "Clean"
      - "Rebuild"
      - "Development Editor"
      - "Shipping"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_hot_reload_build_release_and_cicd_q7
  question: 新增 C++ 类、模块或插件时，团队是否说明其对 Live Coding 可用性的影响，以及何时必须重启编辑器？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Docs/"
      - "README*"
      - "*.uproject"
      - "*.uplugin"
      - "Source/**/*.Build.cs"
    keywords:
      - "Restart Editor"
      - "Live Coding"
      - "Module"
      - "Plugin"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_hot_reload_build_release_and_cicd_q8
  question: 是否存在专门面向本地开发的快速构建入口，并且它与正式 Shipping 或 Release 流水线在参数和产物上明确分叉？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Build/"
      - "Scripts/"
      - ".github/workflows/"
      - "Jenkinsfile"
      - "README*"
    keywords:
      - "Development"
      - "Shipping"
      - "BuildEditor"
      - "BuildCookRun"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_hot_reload_build_release_and_cicd_q9
  question: CI 或发版前是否会强制清理 `Binaries/Intermediate/Saved` 中可能由热重载残留的状态，避免产物污染？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Build/"
      - "Scripts/"
      - ".github/workflows/"
      - "Jenkinsfile"
      - "Tools/"
    keywords:
      - "Binaries"
      - "Intermediate"
      - "Saved"
      - "DeleteDirectory"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_hot_reload_build_release_and_cicd_q10
  question: 若项目同时使用脚本热更或资源热更新方案，C++ Live Coding 与脚本层热更新之间是否有先后顺序和冲突规避规则？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Docs/"
      - "Build/"
      - "Scripts/"
      - "Source/**/*Lua*"
      - "Plugins/"
    keywords:
      - "hotfix"
      - "reload"
      - "Live Coding"
      - "patch"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
