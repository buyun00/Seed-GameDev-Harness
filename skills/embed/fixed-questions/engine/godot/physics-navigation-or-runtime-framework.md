---
name: fixed-questions-engine-godot-physics-navigation-or-runtime-framework
description: godot / 物理、导航或运行时框架 固定问题模板
matrix_id: engine.godot.physics_navigation_or_runtime_framework
axis: engine
engine: godot
direction_id: physics_navigation_or_runtime_framework
owner: researcher-godot
question_set_id: qs-godot-physics-navigation-or-runtime-framework
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.godot.physics_navigation_or_runtime_framework 的固定问题模板。
- 补充该引擎物理、寻路和运行时框架主路径上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: godot_physics_navigation_or_runtime_framework_q1
  question: 项目主运行时是 `CharacterBody`、`RigidBody`、`Area` 还是自定义 runtime framework 驱动？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.tscn`
      - `characters/`
      - `navigation/`
      - `physics/`
    keywords:
      - `_physics_process`
      - `CharacterBody2D`
      - `CharacterBody3D`
      - `RigidBody2D`
      - `RigidBody3D`
      - `Area2D`
      - `NavigationAgent2D`
      - `NavigationAgent3D`
      - `NavigationServer`
      - `move_and_slide`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_physics_navigation_or_runtime_framework_q2
  question: 固定帧逻辑主要由哪些脚本或节点在 `_physics_process()` 中承担？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.tscn`
      - `characters/`
      - `navigation/`
      - `physics/`
    keywords:
      - `_physics_process`
      - `CharacterBody2D`
      - `CharacterBody3D`
      - `RigidBody2D`
      - `RigidBody3D`
      - `Area2D`
      - `NavigationAgent2D`
      - `NavigationAgent3D`
      - `NavigationServer`
      - `move_and_slide`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_physics_navigation_or_runtime_framework_q3
  question: 角色移动、碰撞响应和地面/斜坡处理的核心实现在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.tscn`
      - `characters/`
      - `navigation/`
      - `physics/`
    keywords:
      - `_physics_process`
      - `CharacterBody2D`
      - `CharacterBody3D`
      - `RigidBody2D`
      - `RigidBody3D`
      - `Area2D`
      - `NavigationAgent2D`
      - `NavigationAgent3D`
      - `NavigationServer`
      - `move_and_slide`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_physics_navigation_or_runtime_framework_q4
  question: 碰撞层、mask 和物理查询约定写在哪些配置或基础类里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.tscn`
      - `characters/`
      - `navigation/`
      - `physics/`
    keywords:
      - `_physics_process`
      - `CharacterBody2D`
      - `CharacterBody3D`
      - `RigidBody2D`
      - `RigidBody3D`
      - `Area2D`
      - `NavigationAgent2D`
      - `NavigationAgent3D`
      - `NavigationServer`
      - `move_and_slide`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_physics_navigation_or_runtime_framework_q5
  question: 射线、shape cast、overlap 查询是直接分散调用，还是有统一 physics helper？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.tscn`
      - `characters/`
      - `navigation/`
      - `physics/`
    keywords:
      - `_physics_process`
      - `CharacterBody2D`
      - `CharacterBody3D`
      - `RigidBody2D`
      - `RigidBody3D`
      - `Area2D`
      - `NavigationAgent2D`
      - `NavigationAgent3D`
      - `NavigationServer`
      - `move_and_slide`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_physics_navigation_or_runtime_framework_q6
  question: 导航系统是否使用 `NavigationAgent`、`NavigationRegion`、`NavigationServer` 或自定义寻路？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.tscn`
      - `characters/`
      - `navigation/`
      - `physics/`
    keywords:
      - `_physics_process`
      - `CharacterBody2D`
      - `CharacterBody3D`
      - `RigidBody2D`
      - `RigidBody3D`
      - `Area2D`
      - `NavigationAgent2D`
      - `NavigationAgent3D`
      - `NavigationServer`
      - `move_and_slide`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_physics_navigation_or_runtime_framework_q7
  question: AI 或角色路径规划、避障和重新寻路的入口在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.tscn`
      - `characters/`
      - `navigation/`
      - `physics/`
    keywords:
      - `_physics_process`
      - `CharacterBody2D`
      - `CharacterBody3D`
      - `RigidBody2D`
      - `RigidBody3D`
      - `Area2D`
      - `NavigationAgent2D`
      - `NavigationAgent3D`
      - `NavigationServer`
      - `move_and_slide`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_physics_navigation_or_runtime_framework_q8
  question: 计时器、tick system、状态机或 ECS-like runtime framework 是否与物理或导航耦合？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.tscn`
      - `characters/`
      - `navigation/`
      - `physics/`
    keywords:
      - `_physics_process`
      - `CharacterBody2D`
      - `CharacterBody3D`
      - `RigidBody2D`
      - `RigidBody3D`
      - `Area2D`
      - `NavigationAgent2D`
      - `NavigationAgent3D`
      - `NavigationServer`
      - `move_and_slide`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_physics_navigation_or_runtime_framework_q9
  question: 2D 与 3D 物理/导航是否共存？目录和模块如何拆分？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.tscn`
      - `characters/`
      - `navigation/`
      - `physics/`
    keywords:
      - `_physics_process`
      - `CharacterBody2D`
      - `CharacterBody3D`
      - `RigidBody2D`
      - `RigidBody3D`
      - `Area2D`
      - `NavigationAgent2D`
      - `NavigationAgent3D`
      - `NavigationServer`
      - `move_and_slide`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_physics_navigation_or_runtime_framework_q10
  question: 调试 physics 或 navigation 的工具、可视化或开发开关写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.tscn`
      - `characters/`
      - `navigation/`
      - `physics/`
    keywords:
      - `_physics_process`
      - `CharacterBody2D`
      - `CharacterBody3D`
      - `RigidBody2D`
      - `RigidBody3D`
      - `Area2D`
      - `NavigationAgent2D`
      - `NavigationAgent3D`
      - `NavigationServer`
      - `move_and_slide`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
