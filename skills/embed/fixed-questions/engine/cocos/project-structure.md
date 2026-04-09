---
name: fixed-questions-engine-cocos-project-structure
description: cocos / 目录结构与模块边界 固定问题模板
matrix_id: engine.cocos.project_structure
axis: engine
engine: cocos
direction_id: project_structure
owner: researcher-cocos
question_set_id: qs-cocos-project-structure
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.cocos.project_structure 的固定问题模板。
- 补充该引擎在目录结构、模块分层和工程边界上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: cocos_project_structure_q1
  question: 项目的运行时代码主入口放在哪里，场景启动、全局初始化和首屏进入路径分别由哪些目录或模块负责？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - assets/
      - assets/scripts/
      - assets/src/
      - settings/
    keywords:
      - main
      - game
      - App
      - director.loadScene
      - bootstrap
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_project_structure_q2
  question: 业务模块是按玩法、系统、场景还是按技术层拆分的，核心模块边界在目录中如何体现？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
      - assets/src/
      - assets/game/
    keywords:
      - module
      - feature
      - system
      - scene
      - manager
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_project_structure_q3
  question: 公共库、基础框架和具体业务代码分别放在哪里，是否存在 common、core、framework、base 一类的共享层？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - extensions/
      - packages/
    keywords:
      - common
      - core
      - framework
      - base
      - utils
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_project_structure_q4
  question: 项目配置、环境配置和构建配置分别沉淀在哪些目录或文件中，运行时如何读取这些配置？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - settings/
      - project.json
      - package.json
      - build-templates/
    keywords:
      - config
      - profile
      - settings
      - env
      - channel
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_project_structure_q5
  question: 原生工程、构建模板、扩展脚本和编辑器插件分别位于哪里，它们与运行时代码的边界是否清晰？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - native/
      - build-templates/
      - extensions/
      - tools/
    keywords:
      - native
      - extension
      - build template
      - hooks
      - plugin
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_project_structure_q6
  question: 场景、Prefab、UI 资源和脚本是否按业务域或包体组织，目录结构能否直接反映功能归属？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/resources/
      - assets/bundles/
      - assets/scenes/
      - assets/prefabs/
    keywords:
      - Scene
      - Prefab
      - ui
      - bundle
      - resources
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_project_structure_q7
  question: 生成产物、缓存目录和源代码目录是否分离，仓库里是否保留了不该提交的构建输出或临时目录？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - build/
      - temp/
      - library/
      - local/
    keywords:
      - build
      - cache
      - temp
      - library
      - generated
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_project_structure_q8
  question: 是否存在明确的编辑器侧代码与运行时代码隔离机制，例如 editor-only、tooling 或 extension package 单独存放？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - extensions/
      - tools/
      - scripts/
      - assets/
    keywords:
      - editor
      - extension
      - tool
      - menu
      - panel
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_project_structure_q9
  question: 资源 bundle、远端资源、热更新资源和本地静态资源在目录层面如何分仓，是否有统一约定？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - remote-assets/
      - build/
      - manifest/
    keywords:
      - bundle
      - remote
      - hotupdate
      - manifest
      - resources
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_project_structure_q10
  question: 仓库中是否存在对模块依赖关系、命名规范或目录约束的自动化检查脚本，还是完全依赖人工约定？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - package.json
      - tools/
      - scripts/
      - .github/
    keywords:
      - lint
      - eslint
      - madge
      - dependency
      - check
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
