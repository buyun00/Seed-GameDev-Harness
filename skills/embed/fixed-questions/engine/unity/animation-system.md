---
name: fixed-questions-engine-unity-animation-system
description: unity / 动画系统 固定问题模板
matrix_id: engine.unity.animation_system
axis: engine
engine: unity
direction_id: animation_system
owner: researcher-unity
question_set_id: qs-unity-animation-system
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unity.animation_system 的固定问题模板。
- 补充该引擎动画栈、状态机和运行时组织上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 taxonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: unity_animation_system_q1
  question: 项目的主动画栈是什么，使用的是 Animator Controller、Timeline / Playables，还是 Spine、DragonBones 等第三方动画系统？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - ProjectSettings/
    keywords:
      - Animator
      - RuntimeAnimatorController
      - PlayableDirector
      - TimelineAsset
      - Spine
      - DragonBones
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_animation_system_q2
  question: 角色或核心对象的 Animator Controller、状态机、Blend Tree 和动画参数资产放在哪里，由谁在运行时挂载或切换？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - AnimatorController
      - BlendTree
      - AnimatorOverrideController
      - SetTrigger
      - SetBool
      - SetFloat
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_animation_system_q3
  question: 动画参数是由哪一层脚本驱动的，调用 Animator.SetTrigger / SetFloat / CrossFade 的真实入口在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - SetTrigger
      - SetFloat
      - SetInteger
      - CrossFade
      - Play
      - Animator.StringToHash
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_animation_system_q4
  question: 项目是否启用了 Root Motion、动画层或 Avatar Mask，这些能力的启用边界和控制点在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - applyRootMotion
      - OnAnimatorMove
      - AvatarMask
      - layers
      - SetLayerWeight
      - rootMotion
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_animation_system_q5
  question: 项目是否依赖 Animation Event、StateMachineBehaviour 或自定义动画回调把动画与玩法逻辑联动起来？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - AnimationEvent
      - StateMachineBehaviour
      - OnStateEnter
      - OnStateExit
      - OnStateUpdate
      - OnAnimatorIK
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_animation_system_q6
  question: 剧情演出或复杂动画是否通过 Timeline / PlayableDirector / PlayableGraph 组织，Playable 资源与绑定代码在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - PlayableDirector
      - TimelineAsset
      - PlayableGraph
      - TrackAsset
      - SignalReceiver
      - SignalAsset
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_animation_system_q7
  question: 如果项目接入了 Spine、Animancer、DOTween 动画序列或其他第三方动画方案，它们和 Animator 的边界是怎样划分的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Packages/manifest.json
    keywords:
      - Spine
      - Animancer
      - DOTweenAnimation
      - SkeletonAnimation
      - SkeletonGraphic
      - Sequence
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_animation_system_q8
  question: 动画 Clip、Override Controller 或运行时加载的动画资源是否通过 Addressables / AssetBundle 动态切换，加载入口在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/AddressableAssetsData/
    keywords:
      - AnimationClip
      - AnimatorOverrideController
      - LoadAssetAsync
      - AssetReferenceT
      - Addressables
      - AssetBundle
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_animation_system_q9
  question: 角色动画是否包含 IK、Procedural Animation 或骨骼后处理逻辑，这些钩子和约束写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - OnAnimatorIK
      - AnimationRigging
      - RigBuilder
      - TwoBoneIKConstraint
      - FinalIK
      - LookAt
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_animation_system_q10
  question: 动画播放完成、打点或状态切换后，项目如何把结果同步给 UI、技能、特效或音频系统？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - AnimationEvent
      - UnityEvent
      - EventBus
      - SignalReceiver
      - VFX
      - PlayOneShot
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

