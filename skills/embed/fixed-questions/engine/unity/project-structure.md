---
name: fixed-questions-engine-unity-project-structure
description: unity / 目录结构与模块边界 固定问题模板
matrix_id: engine.unity.project_structure
axis: engine
engine: unity
direction_id: project_structure
owner: researcher-unity
question_set_id: qs-unity-project-structure
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unity.project_structure 的固定问题模板。
- 补充该引擎在目录结构、模块分层和工程边界上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 taxonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: unity_project_structure_q1
  question: Unity 工程的顶层目录是如何划分职责的，Assets、Packages、ProjectSettings、Tools 等目录各承载什么内容？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - ProjectSettings/
      - Tools/
    keywords:
      - Assets
      - Packages
      - ProjectSettings
      - Tools
      - Documentation
      - README
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_project_structure_q2
  question: 启动场景、Bootstrap、全局入口 Prefab 或初始模块放在哪个目录，由什么命名规则标识？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - ProjectSettings/
    keywords:
      - Bootstrap
      - Entry
      - Init
      - Preload
      - Build Settings
      - startup scene
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_project_structure_q3
  question: 代码模块是否通过 asmdef、Package、子目录或命名空间形成清晰边界，核心模块有哪些？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - "*.asmdef"
    keywords:
      - asmdef
      - Assembly Definition
      - Runtime
      - Editor
      - Feature
      - namespace
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_project_structure_q4
  question: 项目是否使用了 Unity 特殊目录约定，例如 Editor、Resources、StreamingAssets、Plugins、Tests、Gizmos，它们分别放在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - Editor
      - Resources
      - StreamingAssets
      - Plugins
      - Tests
      - Gizmos
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_project_structure_q5
  question: 业务代码是按功能域、玩法系统、场景模块还是技术层分目录的，主分层依据是什么？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - Feature
      - Module
      - System
      - Gameplay
      - UI
      - Common
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_project_structure_q6
  question: Framework / Common / Shared 与 Game / Hotfix / Feature 业务层之间的目录边界是怎样划分的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - Framework
      - Common
      - Shared
      - Game
      - Hotfix
      - Feature
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_project_structure_q7
  question: 第三方资源、插件和子模块是集中放在 Packages / Plugins，还是散落在 Assets 各处？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/Plugins/
    keywords:
      - ThirdParty
      - Plugins
      - Packages
      - External
      - vendor
      - SDK
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_project_structure_q8
  question: 自动生成代码、配置导表产物、协议文件或资源索引放在哪里，是否与手写代码隔离？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Tools/
      - Packages/
    keywords:
      - Generated
      - AutoGen
      - protobuf
      - config
      - table
      - index
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_project_structure_q9
  question: 场景、Prefab、UI、动画、配置和原始资源是否有稳定的目录命名约定，主约定是什么？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - Scenes
      - Prefabs
      - UI
      - Animations
      - Config
      - Art
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_project_structure_q10
  question: 编辑器工具、构建脚本、资源处理脚本和开发辅助工具是否有独立目录与程序集边界？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Tools/
      - Packages/
    keywords:
      - Editor
      - Tools
      - Build
      - Importer
      - MenuItem
      - pipeline
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

