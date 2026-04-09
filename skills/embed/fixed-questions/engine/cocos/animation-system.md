---
name: fixed-questions-engine-cocos-animation-system
description: cocos / 动画系统 固定问题模板
matrix_id: engine.cocos.animation_system
axis: engine
engine: cocos
direction_id: animation_system
owner: researcher-cocos
question_set_id: qs-cocos-animation-system
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.cocos.animation_system 的固定问题模板。
- 补充该引擎动画资源、播放控制和事件驱动上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: cocos_animation_system_q1
  question: 项目主要使用哪类动画方案，Animation、Tween、Spine、DragonBones 或自定义时间轴各自承担什么职责？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - assets/
      - assets/animation/
      - assets/spine/
      - assets/effects/
    keywords:
      - Animation
      - Tween
      - sp.Skeleton
      - dragonBones
      - timeline
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_animation_system_q2
  question: 动画资源如何组织与加载，是否存在独立动画 bundle、角色动作目录或技能特效资源池？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/animation/
      - assets/spine/
      - assets/bundles/
      - assets/effects/
    keywords:
      - clip
      - action
      - effect
      - bundle
      - skeleton
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_animation_system_q3
  question: 动画播放控制由组件自身负责，还是由状态机、表现层管理器或战斗框架统一驱动？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/animation/
      - assets/scripts/
    keywords:
      - play
      - crossFade
      - stateMachine
      - animator
      - animationController
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_animation_system_q4
  question: 动画事件如何回流到业务逻辑，例如攻击命中、特效触发、音效播放或 UI 刷新？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/animation/
      - assets/audio/
    keywords:
      - Animation Event
      - event
      - complete
      - finished
      - frame event
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_animation_system_q5
  question: 角色动作、UI 动效和特效动效是否共用一套封装，还是分别由不同系统维护？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/animation/
      - assets/ui/
      - assets/effects/
    keywords:
      - Tween
      - effect
      - ui animation
      - role animation
      - wrapper
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_animation_system_q6
  question: 动画切换、混合、暂停、倍速和循环策略是直接调用引擎 API，还是有统一高层封装？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/animation/
    keywords:
      - speed
      - wrapMode
      - pause
      - resume
      - blend
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_animation_system_q7
  question: 动画资源释放与复用如何处理，尤其是 Spine、特效和高频 UI 动效是否有缓存池？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/spine/
      - assets/effects/
      - assets/ui/
    keywords:
      - pool
      - cache
      - release
      - skeletonData
      - reuse
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_animation_system_q8
  question: 是否通过配置表、状态枚举或技能脚本驱动动画，而不是在业务代码里硬编码动作名？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/config/
      - assets/animation/
    keywords:
      - animName
      - config
      - enum
      - actionType
      - state
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_animation_system_q9
  question: 动画播放失败、资源缺失或状态错乱时是否有日志、回退动作或兜底表现逻辑？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/animation/
    keywords:
      - error
      - warn
      - default animation
      - fallback
      - missing clip
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_animation_system_q10
  question: 项目是否引入了编辑器扩展、预设模板或导出工具来规范动画资源生产与接入？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - extensions/
      - tools/
      - assets/animation/
    keywords:
      - export
      - pipeline
      - template
      - extension
      - animation tool
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
