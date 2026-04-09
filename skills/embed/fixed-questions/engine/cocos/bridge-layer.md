---
name: fixed-questions-engine-cocos-bridge-layer
description: cocos / 桥接层 固定问题模板
matrix_id: engine.cocos.bridge_layer
axis: engine
engine: cocos
direction_id: bridge_layer
owner: researcher-cocos
question_set_id: qs-cocos-bridge-layer
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.cocos.bridge_layer 的固定问题模板。
- 补充该引擎与脚本层、插件或宿主桥接边界上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: cocos_bridge_layer_q1
  question: JavaScript 或 TypeScript 到原生宿主的桥接入口在哪里，项目使用的是 jsb 反射、手写 wrapper 还是统一 Bridge 管理器？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - assets/
      - native/
      - extensions/
    keywords:
      - jsb
      - reflection
      - bridge
      - wrapper
      - callStaticMethod
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_bridge_layer_q2
  question: 脚本层暴露给原生或第三方 SDK 的能力面有哪些，例如登录、支付、分享、广告、推送或埋点？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - native/
      - extensions/
      - sdk/
    keywords:
      - login
      - pay
      - share
      - ad
      - analytics
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_bridge_layer_q3
  question: 桥接参数是如何序列化的，使用 JSON、字符串约定、结构体映射还是 protobuf 等二进制协议？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - native/
      - proto/
    keywords:
      - JSON.stringify
      - parse
      - serialize
      - protobuf
      - payload
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_bridge_layer_q4
  question: 原生回调返回脚本层时，是直接回调、事件派发还是 Promise/任务封装，回调收口点在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - native/
      - extensions/
    keywords:
      - callback
      - emit
      - Promise
      - resolve
      - eventBus
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_bridge_layer_q5
  question: 不同平台桥接实现是否有统一接口抽象，还是 Android、iOS、Web、小游戏平台各写各的入口？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - native/
      - build-templates/
    keywords:
      - android
      - ios
      - web
      - minigame
      - interface
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_bridge_layer_q6
  question: 桥接错误、超时、权限拒绝和返回码异常是如何统一处理和上报的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - native/
      - sdk/
    keywords:
      - error
      - timeout
      - permission
      - code
      - fail
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_bridge_layer_q7
  question: 脚本层是否存在浏览器预览或编辑器环境下的 mock bridge，以便脱离真机调试？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - extensions/
      - native/
    keywords:
      - mock
      - preview
      - editor
      - stub
      - fallback
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_bridge_layer_q8
  question: 原生线程回调进入脚本层时，是否显式切回主线程或游戏线程，相关约束写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - native/
      - assets/
    keywords:
      - runOnGLThread
      - main thread
      - game thread
      - dispatch
      - scheduler
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_bridge_layer_q9
  question: 桥接层是否承担权限申请、隐私弹窗和合规埋点的统一入口，还是散落在各业务模块中？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - native/
      - sdk/
    keywords:
      - permission
      - privacy
      - tracking
      - authorize
      - consent
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_bridge_layer_q10
  question: 是否存在一层二次封装把引擎 API、平台 API 和第三方 SDK API 统一成业务可调用门面，门面目录位于哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - sdk/
      - native/
    keywords:
      - facade
      - adapter
      - bridgeManager
      - platformService
      - sdkWrapper
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
