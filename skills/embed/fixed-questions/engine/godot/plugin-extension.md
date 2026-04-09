---
name: fixed-questions-engine-godot-plugin-extension
description: godot / 插件与扩展 固定问题模板
matrix_id: engine.godot.plugin_extension
axis: engine
engine: godot
direction_id: plugin_extension
owner: researcher-godot
question_set_id: qs-godot-plugin-extension
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.godot.plugin_extension 的固定问题模板。
- 补充该引擎插件、扩展模块和外部接入方式上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 	axonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: godot_plugin_extension_q1
  question: 项目是否使用 `addons/`、editor plugin、GDExtension 或平台插件扩展 Godot？
  must_find: true
  fatal_if_missing: false
- id: godot_plugin_extension_q2
  question: 每个插件的 `plugin.cfg`、入口脚本和启用方式在哪里？
  must_find: true
  fatal_if_missing: false
- id: godot_plugin_extension_q3
  question: 哪些插件是第三方依赖，哪些是项目自研扩展？
  must_find: true
  fatal_if_missing: false
- id: godot_plugin_extension_q4
  question: 插件扩展的是编辑器、导入流程、运行时能力，还是多者混合？
  must_find: false
  fatal_if_missing: false
- id: godot_plugin_extension_q5
  question: 自研插件的公共 API、配置入口和调用方分布在哪里？
  must_find: false
  fatal_if_missing: false
- id: godot_plugin_extension_q6
  question: `EditorPlugin`、`EditorInspectorPlugin`、`EditorExportPlugin` 等编辑器扩展是否存在？
  must_find: false
  fatal_if_missing: false
- id: godot_plugin_extension_q7
  question: GDExtension 或 native plugin 与普通 `addons` 脚本插件是如何协同的？
  must_find: false
  fatal_if_missing: false
- id: godot_plugin_extension_q8
  question: 插件初始化顺序、依赖关系和自动注册逻辑写在哪里？
  must_find: false
  fatal_if_missing: false
- id: godot_plugin_extension_q9
  question: 插件版本、升级说明和项目锁定方式是否有仓库内证据？
  must_find: false
  fatal_if_missing: false
- id: godot_plugin_extension_q10
  question: 平台专用插件如 Android、iOS、Web 插件的目录与构建接入在哪里？
  must_find: false
  fatal_if_missing: false

## 搜索提示

- paths:
  - `addons/`
  - `plugin.cfg`
  - `project.godot`
  - `*.gdextension`
  - `android/`
  - `ios/`
- keywords:
  - `EditorPlugin`
  - `EditorInspectorPlugin`
  - `EditorExportPlugin`
  - `GDExtension`
  - `plugin`
  - `addon`
  - `enable_plugin`
