---
name: fixed-questions-engine-godot-project-structure
description: godot / 目录结构与模块边界 固定问题模板
matrix_id: engine.godot.project_structure
axis: engine
engine: godot
direction_id: project_structure
owner: researcher-godot
question_set_id: qs-godot-project-structure
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.godot.project_structure 的固定问题模板。
- 补充该引擎在目录结构、模块分层和工程边界上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: godot_project_structure_q1
  question: 项目根里的 `project.godot` 如何组织主场景、autoload、输入映射和基础配置？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `project.godot`
      - `addons/`
      - `autoload/`
      - `scenes/`
      - `scripts/`
      - `*.gdignore`
      - `*.csproj`
    keywords:
      - `autoload`
      - `main_scene`
      - `class_name`
      - `addons`
      - `res://`
      - `.gdignore`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_project_structure_q2
  question: 业务目录更接近 `scene + script`、feature folder 还是 `addons` 驱动？主分层证据在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `project.godot`
      - `addons/`
      - `autoload/`
      - `scenes/`
      - `scripts/`
      - `*.gdignore`
      - `*.csproj`
    keywords:
      - `autoload`
      - `main_scene`
      - `class_name`
      - `addons`
      - `res://`
      - `.gdignore`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_project_structure_q3
  question: `autoload` 单例注册了哪些全局模块？初始化顺序和职责边界写在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `project.godot`
      - `addons/`
      - `autoload/`
      - `scenes/`
      - `scripts/`
      - `*.gdignore`
      - `*.csproj`
    keywords:
      - `autoload`
      - `main_scene`
      - `class_name`
      - `addons`
      - `res://`
      - `.gdignore`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_project_structure_q4
  question: 项目自有 `addons/` 与第三方 `addons/` 如何区分？谁负责启用和配置？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `project.godot`
      - `addons/`
      - `autoload/`
      - `scenes/`
      - `scripts/`
      - `*.gdignore`
      - `*.csproj`
    keywords:
      - `autoload`
      - `main_scene`
      - `class_name`
      - `addons`
      - `res://`
      - `.gdignore`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_project_structure_q5
  question: 可复用场景、脚本和资源分别放在哪些目录？有没有统一命名或前缀约定？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `project.godot`
      - `addons/`
      - `autoload/`
      - `scenes/`
      - `scripts/`
      - `*.gdignore`
      - `*.csproj`
    keywords:
      - `autoload`
      - `main_scene`
      - `class_name`
      - `addons`
      - `res://`
      - `.gdignore`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_project_structure_q6
  question: 共享配置、主题、数据资源是否集中在独立目录或 `Resource` 层？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `project.godot`
      - `addons/`
      - `autoload/`
      - `scenes/`
      - `scripts/`
      - `*.gdignore`
      - `*.csproj`
    keywords:
      - `autoload`
      - `main_scene`
      - `class_name`
      - `addons`
      - `res://`
      - `.gdignore`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_project_structure_q7
  question: `class_name`、基础脚本、基类 scene 的公共约束定义在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `project.godot`
      - `addons/`
      - `autoload/`
      - `scenes/`
      - `scripts/`
      - `*.gdignore`
      - `*.csproj`
    keywords:
      - `autoload`
      - `main_scene`
      - `class_name`
      - `addons`
      - `res://`
      - `.gdignore`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_project_structure_q8
  question: C#、GDExtension 或平台插件目录如何并入 Godot 主工程？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `project.godot`
      - `addons/`
      - `autoload/`
      - `scenes/`
      - `scripts/`
      - `*.gdignore`
      - `*.csproj`
    keywords:
      - `autoload`
      - `main_scene`
      - `class_name`
      - `addons`
      - `res://`
      - `.gdignore`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_project_structure_q9
  question: 哪些目录被 `.gdignore`、`.gitignore` 或导入规则排除，不参与运行时扫描？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `project.godot`
      - `addons/`
      - `autoload/`
      - `scenes/`
      - `scripts/`
      - `*.gdignore`
      - `*.csproj`
    keywords:
      - `autoload`
      - `main_scene`
      - `class_name`
      - `addons`
      - `res://`
      - `.gdignore`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_project_structure_q10
  question: 工具脚本、编辑器脚本、测试脚本和运行时代码如何隔离？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `project.godot`
      - `addons/`
      - `autoload/`
      - `scenes/`
      - `scripts/`
      - `*.gdignore`
      - `*.csproj`
    keywords:
      - `autoload`
      - `main_scene`
      - `class_name`
      - `addons`
      - `res://`
      - `.gdignore`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
