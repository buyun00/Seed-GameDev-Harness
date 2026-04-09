---
name: fixed-questions-engine-unity-event-and-message-system
description: unity / 事件与消息系统 固定问题模板
matrix_id: engine.unity.event_and_message_system
axis: engine
engine: unity
direction_id: event_and_message_system
owner: researcher-unity
question_set_id: qs-unity-event-and-message-system
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unity.event_and_message_system 的固定问题模板。
- 补充该引擎事件、消息和模块通信方式上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 taxonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: unity_event_and_message_system_q1
  question: 项目的主事件 / 消息机制是什么，依赖的是 C# event、UnityEvent、自定义 EventBus，还是 SendMessage 一类机制？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - event
      - UnityEvent
      - EventBus
      - Signal
      - SendMessage
      - BroadcastMessage
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_event_and_message_system_q2
  question: 全局事件总线、消息中心或信号系统的入口类在哪里，由谁创建并持有？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - EventBus
      - MessageCenter
      - SignalBus
      - Messenger
      - Dispatch
      - Subscribe
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_event_and_message_system_q3
  question: 是否存在通过 Inspector 绑定的 UnityEvent / Button.onClick / Timeline Signal 等可视化事件链路？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - UnityEvent
      - Button.onClick
      - AddListener
      - SignalReceiver
      - SignalAsset
      - onValueChanged
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_event_and_message_system_q4
  question: 项目是否仍然使用 SendMessage、BroadcastMessage、反射分发或字符串事件名做动态调用？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - SendMessage
      - BroadcastMessage
      - SendMessageUpwards
      - Invoke
      - reflection
      - string event
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_event_and_message_system_q5
  question: 跨模块传递的消息对象是什么形态，是 enum + payload、命令对象、ScriptableObject channel 还是纯字符串协议？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - enum
      - payload
      - Command
      - Message
      - ScriptableObject
      - channel
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_event_and_message_system_q6
  question: 订阅和反订阅的生命周期放在哪里，是否在 OnEnable / OnDisable / OnDestroy 等阶段统一清理？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - AddListener
      - RemoveListener
      - Subscribe
      - Unsubscribe
      - OnEnable
      - OnDisable
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_event_and_message_system_q7
  question: UI、玩法、场景管理和动画系统之间是如何通过事件解耦的，跨层边界入口在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - UIEvent
      - GameplayEvent
      - SceneEvent
      - AnimationEvent
      - dispatch
      - notify
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_event_and_message_system_q8
  question: 是否存在异步消息队列、主线程分发器或跨线程回主线程的事件桥接？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - MainThread
      - Dispatcher
      - SynchronizationContext
      - queue
      - Post
      - ConcurrentQueue
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_event_and_message_system_q9
  question: 原生 SDK、热更层或资源更新系统的回调是如何接入到项目内部消息系统里的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/Plugins/
    keywords:
      - callback
      - EventBus
      - MessageCenter
      - hotfix
      - update event
      - dispatch
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_event_and_message_system_q10
  question: 事件链路是否带有日志、调试面板、埋点或测试桩，用来排查重复订阅、泄漏或顺序问题？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/Editor/
    keywords:
      - debug
      - log
      - trace
      - profiler
      - duplicate listener
      - event monitor
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

