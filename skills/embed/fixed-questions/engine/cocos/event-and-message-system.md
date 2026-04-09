---
name: fixed-questions-engine-cocos-event-and-message-system
description: cocos / 事件与消息系统 固定问题模板
matrix_id: engine.cocos.event_and_message_system
axis: engine
engine: cocos
direction_id: event_and_message_system
owner: researcher-cocos
question_set_id: qs-cocos-event-and-message-system
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.cocos.event_and_message_system 的固定问题模板。
- 补充该引擎事件派发、全局消息与模块通信方式上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: cocos_event_and_message_system_q1
  question: 项目是否存在全局事件总线或消息中心，入口类型是 EventTarget、Node 事件还是自定义总线？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - assets/
      - assets/scripts/
    keywords:
      - EventTarget
      - eventBus
      - dispatch
      - emit
      - MessageCenter
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_event_and_message_system_q2
  question: UI、业务系统、网络层和平台层之间主要依赖事件通信还是直接调用，边界在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/ui/
      - assets/net/
      - native/
    keywords:
      - emit
      - on(
      - notify
      - message
      - event
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_event_and_message_system_q3
  question: 事件名是否有统一命名约定或集中枚举，还是通过字符串散落定义？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
      - assets/config/
    keywords:
      - enum
      - EVENT_
      - Events
      - message id
      - key
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_event_and_message_system_q4
  question: 监听器注册与注销是否跟随组件生命周期绑定，哪些地方最容易发生重复订阅或泄漏？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
    keywords:
      - onEnable
      - onDisable
      - onDestroy
      - off(
      - once(
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_event_and_message_system_q5
  question: 输入事件是直接使用节点事件系统，还是再封装成统一输入消息流分发给业务？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/ui/
      - assets/input/
    keywords:
      - Input
      - Node.EventType
      - touch
      - keyboard
      - systemEvent
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_event_and_message_system_q6
  question: 网络消息、原生回调和系统广播是否会统一转换成项目内部事件，再交由业务消费？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/net/
      - assets/
      - native/
    keywords:
      - socket
      - response
      - notify
      - callback
      - emit
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_event_and_message_system_q7
  question: 是否存在一次性事件、粘性事件、延迟派发或队列化消息机制，主要用在哪些模块？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
    keywords:
      - once
      - queue
      - sticky
      - delay
      - flush
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_event_and_message_system_q8
  question: 事件系统是否具备类型约束、参数校验或统一日志埋点，还是完全弱类型字符串化？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
    keywords:
      - interface
      - type
      - logEvent
      - assert
      - payload
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_event_and_message_system_q9
  question: 跨场景事件在切场景后如何保活或清理，是否依赖常驻节点、全局单例或静态对象？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
    keywords:
      - persist
      - singleton
      - static
      - global
      - addPersistRootNode
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_event_and_message_system_q10
  question: 是否存在消息调试工具、事件追踪面板或简单日志开关，用于排查事件风暴和错序问题？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - tools/
      - extensions/
      - assets/
    keywords:
      - debug
      - trace
      - log
      - monitor
      - event panel
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
