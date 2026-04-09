---
name: fixed-questions-engine-godot-ui-system
description: godot / UI 系统 固定问题模板
matrix_id: engine.godot.ui_system
axis: engine
engine: godot
direction_id: ui_system
owner: researcher-godot
question_set_id: qs-godot-ui-system
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.godot.ui_system 的固定问题模板。
- 补充该引擎 UI 栈、布局方式和交互主路径上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 	axonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: godot_ui_system_q1
  question: 项目主 UI 栈是 `Control` / `Container`、`CanvasLayer` 还是第三方 addon UI？
  must_find: true
  fatal_if_missing: false
- id: godot_ui_system_q2
  question: UI 界面或面板是如何打开、关闭、压栈或切换的？有没有统一 UI manager？
  must_find: true
  fatal_if_missing: false
- id: godot_ui_system_q3
  question: 按钮点击和 UI 事件是直接 `connect()`，还是经过统一绑定封装？
  must_find: true
  fatal_if_missing: false
- id: godot_ui_system_q4
  question: 主题、皮肤、字体和通用样式资源放在哪里管理？
  must_find: true
  fatal_if_missing: false
- id: godot_ui_system_q5
  question: 布局主要依赖 `Container`、anchor / offset，还是自定义布局脚本？
  must_find: false
  fatal_if_missing: false
- id: godot_ui_system_q6
  question: HUD、弹窗、菜单和世界空间 UI 是如何分层与挂载的？
  must_find: false
  fatal_if_missing: false
- id: godot_ui_system_q7
  question: 通用基类如 `Panel`、`Window`、`View` 是否存在？负责哪些生命周期？
  must_find: false
  fatal_if_missing: false
- id: godot_ui_system_q8
  question: 输入焦点、返回键/Escape、鼠标与手柄导航是谁统一处理？
  must_find: false
  fatal_if_missing: false
- id: godot_ui_system_q9
  question: UI 文本本地化、动态字体和分辨率适配证据在哪里？
  must_find: false
  fatal_if_missing: false
- id: godot_ui_system_q10
  question: UI 动画、过场和状态切换是靠 `AnimationPlayer`、`Tween` 还是自定义状态机？
  must_find: false
  fatal_if_missing: false

## 搜索提示

- paths:
  - `ui/`
  - `*.tscn`
  - `*.gd`
  - `themes/`
  - `fonts/`
- keywords:
  - `Control`
  - `Container`
  - `CanvasLayer`
  - `Theme`
  - `Button`
  - `Popup`
  - `Window`
  - `show(`
  - `hide(`
