---
name: fixed-questions-engine-godot-animation-system
description: godot / 动画系统 固定问题模板
matrix_id: engine.godot.animation_system
axis: engine
engine: godot
direction_id: animation_system
owner: researcher-godot
question_set_id: qs-godot-animation-system
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.godot.animation_system 的固定问题模板。
- 补充该引擎动画栈、状态机和运行时组织上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: godot_animation_system_q1
  question: 项目主动画栈是 `AnimationPlayer`、`AnimationTree`、`Tween` 还是第三方动画 addon？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.tscn`
      - `*.gd`
      - `*.cs`
      - `animations/`
      - `characters/`
    keywords:
      - `AnimationPlayer`
      - `AnimationTree`
      - `Tween`
      - `AnimationLibrary`
      - `animation_finished`
      - `travel(`
      - `Skeleton2D`
      - `Skeleton3D`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_animation_system_q2
  question: 角色或对象动画的主控制入口挂在哪个节点、脚本或 manager 上？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.tscn`
      - `*.gd`
      - `*.cs`
      - `animations/`
      - `characters/`
    keywords:
      - `AnimationPlayer`
      - `AnimationTree`
      - `Tween`
      - `AnimationLibrary`
      - `animation_finished`
      - `travel(`
      - `Skeleton2D`
      - `Skeleton3D`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_animation_system_q3
  question: 项目是否使用 `AnimationTree` 状态机、blend tree 或参数驱动动画？配置写在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.tscn`
      - `*.gd`
      - `*.cs`
      - `animations/`
      - `characters/`
    keywords:
      - `AnimationPlayer`
      - `AnimationTree`
      - `Tween`
      - `AnimationLibrary`
      - `animation_finished`
      - `travel(`
      - `Skeleton2D`
      - `Skeleton3D`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_animation_system_q4
  question: UI 过场、摄像机运动和 gameplay feedback 是否复用同一套动画体系？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.tscn`
      - `*.gd`
      - `*.cs`
      - `animations/`
      - `characters/`
    keywords:
      - `AnimationPlayer`
      - `AnimationTree`
      - `Tween`
      - `AnimationLibrary`
      - `animation_finished`
      - `travel(`
      - `Skeleton2D`
      - `Skeleton3D`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_animation_system_q5
  question: 动画事件是通过 call method track、signal 还是脚本回调驱动业务逻辑？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.tscn`
      - `*.gd`
      - `*.cs`
      - `animations/`
      - `characters/`
    keywords:
      - `AnimationPlayer`
      - `AnimationTree`
      - `Tween`
      - `AnimationLibrary`
      - `animation_finished`
      - `travel(`
      - `Skeleton2D`
      - `Skeleton3D`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_animation_system_q6
  question: 动画资源是按角色/场景分散组织，还是有共享 `AnimationLibrary` / 公共动画库？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.tscn`
      - `*.gd`
      - `*.cs`
      - `animations/`
      - `characters/`
    keywords:
      - `AnimationPlayer`
      - `AnimationTree`
      - `Tween`
      - `AnimationLibrary`
      - `animation_finished`
      - `travel(`
      - `Skeleton2D`
      - `Skeleton3D`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_animation_system_q7
  question: 导入动画与手写 `Tween` / 程序化动画的边界在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.tscn`
      - `*.gd`
      - `*.cs`
      - `animations/`
      - `characters/`
    keywords:
      - `AnimationPlayer`
      - `AnimationTree`
      - `Tween`
      - `AnimationLibrary`
      - `animation_finished`
      - `travel(`
      - `Skeleton2D`
      - `Skeleton3D`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_animation_system_q8
  question: 动画切换条件、优先级和中断规则写在哪些状态脚本或配置里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.tscn`
      - `*.gd`
      - `*.cs`
      - `animations/`
      - `characters/`
    keywords:
      - `AnimationPlayer`
      - `AnimationTree`
      - `Tween`
      - `AnimationLibrary`
      - `animation_finished`
      - `travel(`
      - `Skeleton2D`
      - `Skeleton3D`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_animation_system_q9
  question: Skeletal 2D/3D、根运动、IK 或自定义动画求解如果存在，入口在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.tscn`
      - `*.gd`
      - `*.cs`
      - `animations/`
      - `characters/`
    keywords:
      - `AnimationPlayer`
      - `AnimationTree`
      - `Tween`
      - `AnimationLibrary`
      - `animation_finished`
      - `travel(`
      - `Skeleton2D`
      - `Skeleton3D`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_animation_system_q10
  question: 动画完成、循环和状态同步事件如何通知业务层？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.tscn`
      - `*.gd`
      - `*.cs`
      - `animations/`
      - `characters/`
    keywords:
      - `AnimationPlayer`
      - `AnimationTree`
      - `Tween`
      - `AnimationLibrary`
      - `animation_finished`
      - `travel(`
      - `Skeleton2D`
      - `Skeleton3D`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
