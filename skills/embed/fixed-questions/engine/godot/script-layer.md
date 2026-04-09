---
name: fixed-questions-engine-godot-script-layer
description: godot / 脚本层 固定问题模板
matrix_id: engine.godot.script_layer
axis: engine
engine: godot
direction_id: script_layer
owner: researcher-godot
question_set_id: qs-godot-script-layer
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.godot.script_layer 的固定问题模板。
- 补充该引擎在脚本层组织、职责边界和宿主关系上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: godot_script_layer_q1
  question: 主脚本层是纯 GDScript，还是 GDScript + C# 混合？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `autoload/`
      - `scripts/`
      - `addons/`
    keywords:
      - `extends`
      - `class_name`
      - `@export`
      - `export`
      - `signal`
      - `preload(`
      - `load(`
      - `@tool`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_script_layer_q2
  question: 脚本主要以 scene attached script、独立逻辑类还是 autoload service 形式存在？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `autoload/`
      - `scripts/`
      - `addons/`
    keywords:
      - `extends`
      - `class_name`
      - `@export`
      - `export`
      - `signal`
      - `preload(`
      - `load(`
      - `@tool`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_script_layer_q3
  question: `class_name`、`extends` 和脚本继承链如何组织复用？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `autoload/`
      - `scripts/`
      - `addons/`
    keywords:
      - `extends`
      - `class_name`
      - `@export`
      - `export`
      - `signal`
      - `preload(`
      - `load(`
      - `@tool`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_script_layer_q4
  question: `@export` 或 `export` 属性定义了哪些 inspector 配置契约？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `autoload/`
      - `scripts/`
      - `addons/`
    keywords:
      - `extends`
      - `class_name`
      - `@export`
      - `export`
      - `signal`
      - `preload(`
      - `load(`
      - `@tool`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_script_layer_q5
  question: 项目里的 `signal` 主要在脚本层哪个位置定义和发射？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `autoload/`
      - `scripts/`
      - `addons/`
    keywords:
      - `extends`
      - `class_name`
      - `@export`
      - `export`
      - `signal`
      - `preload(`
      - `load(`
      - `@tool`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_script_layer_q6
  question: 运行时脚本是优先 `preload()`、`load()` 还是直接通过场景或资源引用获取？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `autoload/`
      - `scripts/`
      - `addons/`
    keywords:
      - `extends`
      - `class_name`
      - `@export`
      - `export`
      - `signal`
      - `preload(`
      - `load(`
      - `@tool`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_script_layer_q7
  question: 是否存在 `@tool` / tool script，在编辑器阶段执行项目脚本？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `autoload/`
      - `scripts/`
      - `addons/`
    keywords:
      - `extends`
      - `class_name`
      - `@export`
      - `export`
      - `signal`
      - `preload(`
      - `load(`
      - `@tool`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_script_layer_q8
  question: GDScript 与 C# 的职责边界在哪里？谁负责节点脚本，谁负责服务逻辑？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `autoload/`
      - `scripts/`
      - `addons/`
    keywords:
      - `extends`
      - `class_name`
      - `@export`
      - `export`
      - `signal`
      - `preload(`
      - `load(`
      - `@tool`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_script_layer_q9
  question: 数据型 `Resource` 脚本和行为型脚本是怎么分层的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `autoload/`
      - `scripts/`
      - `addons/`
    keywords:
      - `extends`
      - `class_name`
      - `@export`
      - `export`
      - `signal`
      - `preload(`
      - `load(`
      - `@tool`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_script_layer_q10
  question: 脚本热重载、动态加载或 mod / 插件脚本如果存在，入口写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `autoload/`
      - `scripts/`
      - `addons/`
    keywords:
      - `extends`
      - `class_name`
      - `@export`
      - `export`
      - `signal`
      - `preload(`
      - `load(`
      - `@tool`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
