---
name: fixed-questions-engine-godot-hot-reload
description: Godot 热更新/热重载方向固定问题
matrix_id: engine.godot.hot_reload
axis: engine
engine: godot
direction_id: hot_reload
owner: researcher-godot
question_set_id: qs-godot-hot-reload
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.godot.hot_reload 的固定问题模板。
- 补充该引擎热更新、热重载和开发期回滚机制上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 taxonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: godot_hot_reload_q1
  question: 项目里的“热更/热重载”到底指什么？是 addon/plugin 重载、自定义脚本重载，还是仅编辑器默认重载？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - `addons/`
      - `autoload/`
      - `project.godot`
      - `*.gd`
      - `*.cs`
    keywords:
      - `reload`
      - `tool`
      - `EditorPlugin`
      - `ResourceLoader`
      - `load(`
      - `watch`
      - `hot`
      - `plugin`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_hot_reload_q2
  question: 如果没有独立方案，仓库里哪里能证明项目只是依赖 Godot 默认脚本或资源重载？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `addons/`
      - `autoload/`
      - `project.godot`
      - `*.gd`
      - `*.cs`
    keywords:
      - `reload`
      - `tool`
      - `EditorPlugin`
      - `ResourceLoader`
      - `load(`
      - `watch`
      - `hot`
      - `plugin`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_hot_reload_q3
  question: 热重载入口在哪里？由 addon、autoload、tool script 还是自定义 manager 触发？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - `addons/`
      - `autoload/`
      - `project.godot`
      - `*.gd`
      - `*.cs`
    keywords:
      - `reload`
      - `tool`
      - `EditorPlugin`
      - `ResourceLoader`
      - `load(`
      - `watch`
      - `hot`
      - `plugin`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_hot_reload_q4
  question: 被重载的对象是什么？脚本、scene、resource、pck 还是插件模块？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `addons/`
      - `autoload/`
      - `project.godot`
      - `*.gd`
      - `*.cs`
    keywords:
      - `reload`
      - `tool`
      - `EditorPlugin`
      - `ResourceLoader`
      - `load(`
      - `watch`
      - `hot`
      - `plugin`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_hot_reload_q5
  question: 这个机制是编辑器能力、开发期调试能力，还是发布后运行时能力？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - `addons/`
      - `autoload/`
      - `project.godot`
      - `*.gd`
      - `*.cs`
    keywords:
      - `reload`
      - `tool`
      - `EditorPlugin`
      - `ResourceLoader`
      - `load(`
      - `watch`
      - `hot`
      - `plugin`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_hot_reload_q6
  question: 触发方式是文件监听、控制台命令、远程消息还是手动按钮？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `addons/`
      - `autoload/`
      - `project.godot`
      - `*.gd`
      - `*.cs`
    keywords:
      - `reload`
      - `tool`
      - `EditorPlugin`
      - `ResourceLoader`
      - `load(`
      - `watch`
      - `hot`
      - `plugin`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_hot_reload_q7
  question: 重载前后的状态迁移、节点重绑或数据恢复逻辑写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `addons/`
      - `autoload/`
      - `project.godot`
      - `*.gd`
      - `*.cs`
    keywords:
      - `reload`
      - `tool`
      - `EditorPlugin`
      - `ResourceLoader`
      - `load(`
      - `watch`
      - `hot`
      - `plugin`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_hot_reload_q8
  question: 重载失败、版本不兼容或资源损坏时如何回退？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `addons/`
      - `autoload/`
      - `project.godot`
      - `*.gd`
      - `*.cs`
    keywords:
      - `reload`
      - `tool`
      - `EditorPlugin`
      - `ResourceLoader`
      - `load(`
      - `watch`
      - `hot`
      - `plugin`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_hot_reload_q9
  question: 哪些内容允许热重载，哪些内容明确禁止热重载？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `addons/`
      - `autoload/`
      - `project.godot`
      - `*.gd`
      - `*.cs`
    keywords:
      - `reload`
      - `tool`
      - `EditorPlugin`
      - `ResourceLoader`
      - `load(`
      - `watch`
      - `hot`
      - `plugin`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_hot_reload_q10
  question: 如果项目把它当项目级方案，相关发布、版本切换或回退逻辑写在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `addons/`
      - `autoload/`
      - `project.godot`
      - `*.gd`
      - `*.cs`
    keywords:
      - `reload`
      - `tool`
      - `EditorPlugin`
      - `ResourceLoader`
      - `load(`
      - `watch`
      - `hot`
      - `plugin`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
