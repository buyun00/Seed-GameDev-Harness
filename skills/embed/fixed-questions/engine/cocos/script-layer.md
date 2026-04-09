---
name: fixed-questions-engine-cocos-script-layer
description: cocos / 脚本层 固定问题模板
matrix_id: engine.cocos.script_layer
axis: engine
engine: cocos
direction_id: script_layer
owner: researcher-cocos
question_set_id: qs-cocos-script-layer
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.cocos.script_layer 的固定问题模板。
- 补充该引擎脚本组织、脚本运行模式和业务承载方式上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: cocos_script_layer_q1
  question: 项目脚本层是以 TypeScript、JavaScript 还是两者混用为主，实际业务入口文件位于哪里？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - assets/
      - assets/scripts/
      - package.json
      - tsconfig.json
    keywords:
      - @ccclass
      - .ts
      - .js
      - main
      - entry
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_script_layer_q2
  question: 脚本是否普遍使用 @ccclass、@property 和序列化字段暴露编辑器配置，还是更偏向纯代码初始化？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
    keywords:
      - @ccclass
      - @property
      - serializable
      - decorator
      - Component
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_script_layer_q3
  question: 业务逻辑是主要挂在 Component 上，还是抽成 service、manager、model 等独立脚本层对象？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
      - assets/src/
    keywords:
      - extends Component
      - Manager
      - Service
      - Model
      - Controller
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_script_layer_q4
  question: 脚本层如何组织全局访问能力，例如单例、服务定位器、事件总线或依赖注入容器？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
    keywords:
      - instance
      - singleton
      - ServiceLocator
      - inject
      - eventBus
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_script_layer_q5
  question: 异步流程在脚本层主要使用 Promise、async/await、回调还是自定义任务框架，关键链路在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
    keywords:
      - async
      - await
      - Promise
      - callback
      - Task
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_script_layer_q6
  question: 数据配置、协议代码、枚举或自动生成脚本是如何接入脚本层的，生成物目录是否固定？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - scripts/
      - tools/
      - proto/
    keywords:
      - generated
      - proto
      - config
      - enum
      - codegen
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_script_layer_q7
  question: 定时器、Tween、schedule 和轮询逻辑主要沉淀在哪些基类或工具封装中？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
    keywords:
      - schedule
      - Tween
      - setTimeout
      - timer
      - update(
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_script_layer_q8
  question: 编辑器暴露属性、运行时状态字段和纯逻辑字段之间有没有明确分层，是否经常出现同一组件既配表又写业务？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
    keywords:
      - @property
      - private
      - protected
      - serialize
      - data
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_script_layer_q9
  question: 调试开关、环境开关和开发辅助逻辑是如何注入脚本层的，是否存在 DEV、DEBUG 或渠道宏分支？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - settings/
      - package.json
    keywords:
      - DEBUG
      - DEV
      - PREVIEW
      - macro
      - env
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_script_layer_q10
  question: 是否存在动态加载脚本、eval、热修复脚本或远端逻辑注入能力，如果有其边界和入口在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - remote-assets/
      - native/
    keywords:
      - eval
      - require(
      - hotfix
      - remote script
      - jsb
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
