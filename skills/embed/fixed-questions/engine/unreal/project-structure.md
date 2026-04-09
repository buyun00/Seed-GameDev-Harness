---
name: fixed-questions-engine-unreal-project-structure
description: unreal / 目录结构与模块边界 固定问题模板
matrix_id: engine.unreal.project_structure
axis: engine
engine: unreal
direction_id: project_structure
owner: researcher-unreal
question_set_id: qs-unreal-project-structure
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unreal.project_structure 的固定问题模板。
- 补充该引擎在目录结构、模块分层和工程边界上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: unreal_project_structure_q1
  question: 项目是否采用标准的 `.uproject + Source + Content + Config + Plugins` 结构，主工程入口文件在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "*.uproject"
      - "Source/"
      - "Content/"
      - "Config/"
      - "Plugins/"
    keywords:
      - "Modules"
      - "EngineAssociation"
      - "FileVersion"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_project_structure_q2
  question: `Source/` 下有哪些核心模块，它们分别由哪些 `*.Build.cs` 和 `*.Target.cs` 定义？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.Build.cs"
      - "Source/**/*.Target.cs"
    keywords:
      - "PublicDependencyModuleNames"
      - "PrivateDependencyModuleNames"
      - "TargetType"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_project_structure_q3
  question: 主游戏模块和启动入口是否清晰，可否定位 `IMPLEMENT_PRIMARY_GAME_MODULE` 或等价主模块定义？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Source/**/*.h"
    keywords:
      - "IMPLEMENT_PRIMARY_GAME_MODULE"
      - "IMPLEMENT_GAME_MODULE"
      - "FDefaultGameModuleImpl"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_project_structure_q4
  question: 工程组织更偏向单一 Game 模块、多个业务模块，还是以 `Plugins/` 为主的 feature 化结构？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/*/"
      - "Plugins/*/"
      - "*.uproject"
    keywords:
      - "\"Modules\""
      - "\"Plugins\""
      - "Enabled"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_project_structure_q5
  question: 是否存在 Runtime / Editor / Developer 类型的模块边界，编辑器代码是否与运行时代码分离？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.Build.cs"
      - "Plugins/**/*.Build.cs"
    keywords:
      - "Type = ModuleType.Editor"
      - "UnrealEd"
      - "DeveloperSettings"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_project_structure_q6
  question: `Config/` 是否按系统或平台拆分配置，哪些 `Default*.ini` / 平台 ini 承担主要工程配置？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/*.ini"
      - "Config/**/Default*.ini"
      - "Config/**/Windows*.ini"
      - "Config/**/Android*.ini"
    keywords:
      - "[/Script/"
      - "GameDefaultMap"
      - "GlobalDefaultGameMode"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_project_structure_q7
  question: `Content/` 是否有统一的资源分层规范，比如按 feature、系统或资源类型管理地图、角色、UI 和动画？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Content/"
      - "Content/Maps/"
      - "Content/UI/"
      - "Content/Characters/"
    keywords:
      - "Maps"
      - "UI"
      - "Characters"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_project_structure_q8
  question: 是否存在独立的公共基础层或 Core 模块，供多个 gameplay 模块、插件或 UI 模块复用？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/*Core*/"
      - "Source/*Common*/"
      - "Plugins/*Core*/"
    keywords:
      - "Core"
      - "Common"
      - "Shared"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_project_structure_q9
  question: 测试、命令行工具或编辑器辅助模块是否独立存在，而不是混在主游戏模块中？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Test*"
      - "Source/**/*Commandlet*"
      - "Plugins/**/*Editor*"
    keywords:
      - "IMPLEMENT_SIMPLE_AUTOMATION_TEST"
      - "Commandlet"
      - "Editor"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_project_structure_q10
  question: 第三方库、SDK 或私有插件是通过 `Plugins/`、`ThirdParty/` 还是模块级 `Build.cs` 依赖接入的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Plugins/"
      - "Source/**/ThirdParty/"
      - "Source/**/*.Build.cs"
    keywords:
      - "PublicAdditionalLibraries"
      - "PublicDelayLoadDLLs"
      - "ThirdParty"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
