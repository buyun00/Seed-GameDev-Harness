---
name: fixed-questions-engine-godot-asset-pipeline
description: godot / 资源管线 固定问题模板
matrix_id: engine.godot.asset_pipeline
axis: engine
engine: godot
direction_id: asset_pipeline
owner: researcher-godot
question_set_id: qs-godot-asset-pipeline
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.godot.asset_pipeline 的固定问题模板。
- 补充该引擎资源组织、加载、引用和释放上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 	axonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: godot_asset_pipeline_q1
  question: 资源主加载入口是 `preload()`、`load()`、`ResourceLoader` 还是自定义封装？
  must_find: true
  fatal_if_missing: false
- id: godot_asset_pipeline_q2
  question: 场景资源是否通过 `PackedScene` 动态实例化？入口和缓存策略写在哪里？
  must_find: true
  fatal_if_missing: false
- id: godot_asset_pipeline_q3
  question: 资源是在哪里加载、在哪里释放的？有没有统一 loader、pool 或 handle 层？
  must_find: true
  fatal_if_missing: false
- id: godot_asset_pipeline_q4
  question: 纹理、音频、UI、场景、配置等不同类型资源的目录组织和命名约定是什么？
  must_find: false
  fatal_if_missing: false
- id: godot_asset_pipeline_q5
  question: 项目是否依赖 `.import` 产物、导入预设或自定义 import plugin？
  must_find: false
  fatal_if_missing: false
- id: godot_asset_pipeline_q6
  question: 同步加载、异步加载和后台预加载分别由谁负责？
  must_find: false
  fatal_if_missing: false
- id: godot_asset_pipeline_q7
  question: 资源缓存、引用计数、对象池或重用策略证据在哪里？
  must_find: false
  fatal_if_missing: false
- id: godot_asset_pipeline_q8
  question: 是否存在外部 `PCK`、DLC、mod 资源包或自定义资源版本目录？
  must_find: false
  fatal_if_missing: false
- id: godot_asset_pipeline_q9
  question: `ResourcePreloader`、场景内强引用和运行时动态加载在项目里如何分工？
  must_find: false
  fatal_if_missing: false
- id: godot_asset_pipeline_q10
  question: 调试或发布时，资源缺失、路径变化和 fallback 逻辑是如何处理的？
  must_find: false
  fatal_if_missing: false

## 搜索提示

- paths:
  - `*.tscn`
  - `*.tres`
  - `*.res`
  - `*.gd`
  - `.import/`
- keywords:
  - `preload(`
  - `load(`
  - `ResourceLoader`
  - `PackedScene`
  - `instantiate(`
  - `ResourcePreloader`
  - `queue_free`
  - `PCKPacker`
