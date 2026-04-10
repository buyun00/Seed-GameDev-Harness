---
name: fixed-questions-composite-unity-event-and-message-system-network-protocol-and-sync
description: unity / event-and-message-system x network-protocol-and-sync 交叉固定问题模板
composite_id: composite.unity.event_and_message_system.network_protocol_and_sync
axis: composite
engine: unity
direction_id: event_and_message_system
capability: network_protocol_and_sync
capability_id: network_protocol_and_sync
owner: builder-engine
researcher_owner: researcher-unity
capability_owner: researcher-infra
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.unity.event_and_message_system.network_protocol_and_sync` 的交叉固定问题模板。
- 这里只补 `engine.unity.event_and_message_system` 与 `capability.network_protocol_and_sync` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/unity/event-and-message-system.md` 和 `fixed-questions/capability/network-protocol-and-sync.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。

## 固定问题

- id: unity_event_and_message_system_network_protocol_and_sync_q1
  question: 网络层收到的包、RPC 或自定义消息是如何转成项目内部事件 / 消息总线事件的，第一跳分发入口在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/Plugins/
    keywords:
      - ClientRpc
      - ServerRpc
      - CustomMessagingManager
      - dispatch
      - EventBus
      - MessageCenter
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_event_and_message_system_network_protocol_and_sync_q2
  question: 协议号、消息名、Proto 类型或命令字与本地事件类型之间的映射表写在哪里，是静态注册还是自动生成？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Tools/
    keywords:
      - opcode
      - cmd
      - message id
      - protobuf
      - register
      - generated
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_event_and_message_system_network_protocol_and_sync_q3
  question: 网络消息处理器在哪里注册并持有，是 NetworkManager、Session、Gateway 还是项目自定义 MessageRouter 负责？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - NetworkManager
      - handler
      - router
      - gateway
      - session
      - subscribe
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_event_and_message_system_network_protocol_and_sync_q4
  question: 收到网络消息后，是否先进入主线程队列、逻辑帧队列或 Tick 系统，再分发给 UI / 战斗 / 场景模块？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - queue
      - MainThread
      - Tick
      - dispatcher
      - SynchronizationContext
      - ConcurrentQueue
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_event_and_message_system_network_protocol_and_sync_q5
  question: 连接、断线、重连、房间切换和同步完成等网络状态变化，是如何被包装成项目统一事件通知给 UI 和业务层的？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - OnClientConnectedCallback
      - OnClientDisconnectCallback
      - reconnect
      - room
      - state change
      - notify
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_event_and_message_system_network_protocol_and_sync_q6
  question: 初始全量同步、增量同步、快照回放或晚加入补发的数据，是通过单独事件链路还是与普通实时消息共用一套分发机制？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Tools/
    keywords:
      - snapshot
      - full sync
      - delta
      - late join
      - replay
      - state sync
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_event_and_message_system_network_protocol_and_sync_q7
  question: 本地预测、服务器确认、重发、回滚或重演相关的网络事件在消息系统中是否有专门事件类型或时序约束？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - predict
      - reconcile
      - ack
      - resend
      - rollback
      - replay
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_event_and_message_system_network_protocol_and_sync_q8
  question: 网络对象的 Spawn、Despawn、场景切换或所有权变更，是否会继续转成项目内部事件供其他系统监听？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - spawn
      - despawn
      - ownership
      - scene event
      - NetworkObject
      - notify
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_event_and_message_system_network_protocol_and_sync_q9
  question: 可靠 / 不可靠通道、消息顺序、去重和背压问题，是在网络层处理完再抛事件，还是在消息系统层继续兜底？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - reliable
      - unreliable
      - sequence
      - deduplicate
      - queue overflow
      - backpressure
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_event_and_message_system_network_protocol_and_sync_q10
  question: 项目是否提供网络事件链路的日志、抓包映射、消息回放或调试面板，用来排查同步时序问题？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Assets/Editor/
      - Packages/
      - Tools/
    keywords:
      - trace
      - log
      - replay
      - debug panel
      - packet
      - profiler
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

  - `opcode`
  - `dispatch`
  - `EventBus`
  - `snapshot`
  - `reconcile`
  - `spawn`
