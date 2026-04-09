---
name: fixed-questions-engine-unreal-animation-system
description: unreal / 动画系统 固定问题模板
matrix_id: engine.unreal.animation_system
axis: engine
engine: unreal
direction_id: animation_system
owner: researcher-unreal
question_set_id: qs-unreal-animation-system
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unreal.animation_system 的固定问题模板。
- 补充该引擎动画栈、状态机和运行时组织上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: unreal_animation_system_q1
  question: 项目角色或核心可动对象主要依赖哪些 `AnimBlueprint / AnimInstance`，入口资产和基类在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Content/**/ABP_*"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "UAnimInstance"
      - "AnimBlueprint"
      - "AnimClass"
      - "ABP_"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_animation_system_q2
  question: 动画主栈更偏向状态机、`BlendSpace`、`Montage` 还是多者组合，核心实现证据在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Content/**/ABP_*"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "BlendSpace"
      - "Montage"
      - "State Machine"
      - "AnimGraph"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_animation_system_q3
  question: 角色状态如何传给动画层，是否通过 `AnimInstance`、角色组件、接口或 Gameplay Tag 同步？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "GetAnimInstance"
      - "UAnimInstance"
      - "NativeUpdateAnimation"
      - "GameplayTag"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_animation_system_q4
  question: 技能、攻击或交互是否通过 `Montage` 播放，通知点和中断逻辑在哪里定义？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Source/**/*.h"
      - "Content/**/ABP_*"
    keywords:
      - "Montage_Play"
      - "PlayAnimMontage"
      - "Montage_JumpToSection"
      - "OnMontageEnded"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_animation_system_q5
  question: `AnimNotify / AnimNotifyState` 是否承担 gameplay 事件、音效、特效或命中窗等关键桥接？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*AnimNotify*"
      - "Source/**/*.cpp"
      - "Content/**/ABP_*"
    keywords:
      - "UAnimNotify"
      - "UAnimNotifyState"
      - "AnimNotify"
      - "Received_Notify"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_animation_system_q6
  question: 是否使用 `Sequencer` 处理剧情、过场、镜头或 UI/角色联动动画？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Content/"
      - "Source/**/*.cpp"
      - "Source/**/*.h"
    keywords:
      - "LevelSequence"
      - "ULevelSequence"
      - "SequencePlayer"
      - "MovieScene"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_animation_system_q7
  question: 是否接入 `Control Rig`、`IK Rig`、`IK Retargeter` 或其他运行时 IK / 重定向方案？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "*.uproject"
      - "Source/**/*.Build.cs"
      - "Content/"
    keywords:
      - "ControlRig"
      - "IKRig"
      - "IKRetargeter"
      - "FullBodyIK"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_animation_system_q8
  question: 动画蓝图是否使用 `Linked Anim Layer`、层级混合或分身体系来复用角色动画逻辑？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Content/**/ABP_*"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "Linked Anim Layer"
      - "Layered blend"
      - "LinkedAnimGraph"
      - "AnimLayer"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_animation_system_q9
  question: 根运动、移动同步和动画驱动物理是否被显式使用，相关约束在哪里定义？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Source/**/*.h"
      - "Config/*.ini"
    keywords:
      - "RootMotion"
      - "Root Motion"
      - "bUseControllerRotationYaw"
      - "CharacterMovement"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_animation_system_q10
  question: 动画系统是否与 GAS、网络同步或武器系统深度耦合，关键连接点在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Source/**/*.h"
    keywords:
      - "AbilitySystemComponent"
      - "GameplayTag"
      - "Montage"
      - "OnRep_"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
