---
name: fixed-questions-engine-godot-scene-graph-and-lifecycle
description: godot / 场景图与生命周期 固定问题模板
matrix_id: engine.godot.scene_graph_and_lifecycle
axis: engine
engine: godot
direction_id: scene_graph_and_lifecycle
owner: researcher-godot
question_set_id: qs-godot-scene-graph-and-lifecycle
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.godot.scene_graph_and_lifecycle 的固定问题模板。
- 补充该引擎在场景/节点/对象图与生命周期主路径上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 	axonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: godot_scene_graph_and_lifecycle_q1
  question: 主入口 scene 是哪个？启动后第一个被实例化的根节点是什么？
  must_find: true
  fatal_if_missing: false
- id: godot_scene_graph_and_lifecycle_q2
  question: 场景切换是直接 `change_scene*`，还是通过自定义 scene manager 或 autoload 封装？
  must_find: true
  fatal_if_missing: false
- id: godot_scene_graph_and_lifecycle_q3
  question: 全局状态放在 autoload，还是挂在常驻 root scene 或 manager 节点上？
  must_find: true
  fatal_if_missing: false
- id: godot_scene_graph_and_lifecycle_q4
  question: 关键生命周期实现主要写在 `_enter_tree()`、`_ready()`、`_exit_tree()` 还是自定义封装里？
  must_find: true
  fatal_if_missing: false
- id: godot_scene_graph_and_lifecycle_q5
  question: 每帧逻辑和固定帧逻辑分别由哪些节点或基类在 `_process()`、`_physics_process()` 中承担？
  must_find: true
  fatal_if_missing: false
- id: godot_scene_graph_and_lifecycle_q6
  question: 场景复用依赖 scene inheritance、`PackedScene.instantiate()` 还是代码动态组装？
  must_find: false
  fatal_if_missing: false
- id: godot_scene_graph_and_lifecycle_q7
  question: 节点依赖通过 `@onready`、`NodePath`、`get_node()` 还是注入型 manager 建立？
  must_find: false
  fatal_if_missing: false
- id: godot_scene_graph_and_lifecycle_q8
  question: 节点销毁和清理是 `queue_free()`、`call_deferred()` 还是统一回收层？
  must_find: false
  fatal_if_missing: false
- id: godot_scene_graph_and_lifecycle_q9
  question: 暂停、恢复、process mode 和常驻场景是如何管理的？
  must_find: false
  fatal_if_missing: false
- id: godot_scene_graph_and_lifecycle_q10
  question: 跨场景状态保存与恢复由谁负责？
  must_find: false
  fatal_if_missing: false

## 搜索提示

- paths:
  - `project.godot`
  - `*.tscn`
  - `*.gd`
  - `autoload/`
  - `scenes/`
- keywords:
  - `_enter_tree`
  - `_ready`
  - `_exit_tree`
  - `_process`
  - `_physics_process`
  - `change_scene_to_file`
  - `PackedScene`
  - `queue_free`
