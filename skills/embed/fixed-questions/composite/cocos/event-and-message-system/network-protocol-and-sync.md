---
name: fixed-questions-composite-cocos-event-and-message-system-network-protocol-and-sync
description: cocos / event-and-message-system x network-protocol-and-sync 交叉固定问题模板
composite_id: composite.cocos.event_and_message_system.network_protocol_and_sync
axis: composite
engine: cocos
direction_id: event_and_message_system
capability: network_protocol_and_sync
capability_id: network_protocol_and_sync
owner: builder-cocos
researcher_owner: researcher-cocos
capability_owner: researcher-infra
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.cocos.event_and_message_system.network_protocol_and_sync` 的交叉固定问题模板。
- 只补充 `engine.cocos.event_and_message_system` 与 `capability.network_protocol_and_sync` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/cocos/event-and-message-system.md` 和 `fixed-questions/capability/network-protocol-and-sync.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 当前先留空模板，后续按实际项目与复用频次补充问题。

## 固定问题

- id: cocos_event_and_message_system_network_protocol_and_sync_q1
  question: 网络层收到协议包后，是在哪里把消息解包并转换成 Cocos 事件系统可消费的事件、通知或消息对象的？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - assets/net/
      - assets/network/
      - assets/msg/
      - assets/scripts/
      - assets/framework/
    keywords:
      - dispatch
      - emit
      - message
      - proto
      - notify
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_event_and_message_system_network_protocol_and_sync_q2
  question: 协议号、消息名和业务事件名之间是否存在统一映射表，还是每个模块自行把网络回包转成 `emit`/`dispatch` 调用？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/net/
      - assets/network/
      - assets/proto/
      - assets/msg/
      - assets/config/
    keywords:
      - message id
      - event
      - mapping
      - opcode
      - enum
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_event_and_message_system_network_protocol_and_sync_q3
  question: Socket 线程、原生网络回调或 WebSocket 回调进入脚本层后，是否显式切回主线程再分发到事件总线，切换入口在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/net/
      - assets/network/
      - native/
      - assets/scripts/
      - assets/framework/
    keywords:
      - WebSocket
      - callback
      - Scheduler
      - dispatch
      - main thread
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_event_and_message_system_network_protocol_and_sync_q4
  question: 请求响应、服务器推送、断线重连、心跳、房间帧同步等不同网络消息，是否共用同一套事件总线，还是拆成多个通道分别处理？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/net/
      - assets/network/
      - assets/framework/
      - assets/battle/
      - assets/scripts/
    keywords:
      - response
      - push
      - reconnect
      - heartbeat
      - frame sync
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_event_and_message_system_network_protocol_and_sync_q5
  question: 场景切换、节点销毁或模块重置时，和网络消息相关的监听器如何清理，是否存在离场后仍接收推送的高风险入口？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/scripts/
      - assets/ui/
      - assets/net/
      - assets/network/
      - assets/scenes/
    keywords:
      - onDestroy
      - off
      - removeListener
      - scene
      - push
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_event_and_message_system_network_protocol_and_sync_q6
  question: 协议 decode、反序列化、数据裁剪和 DTO 到业务模型的转换，是在事件派发前完成，还是由事件监听方各自处理？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/net/
      - assets/network/
      - assets/proto/
      - assets/model/
      - assets/framework/
    keywords:
      - decode
      - deserialize
      - dto
      - model
      - parse
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_event_and_message_system_network_protocol_and_sync_q7
  question: 是否存在针对帧同步或高频同步消息的队列、缓冲区、延迟派发或批处理机制，用来避免直接触发事件风暴？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/battle/
      - assets/net/
      - assets/framework/
      - assets/scripts/
      - assets/network/
    keywords:
      - queue
      - buffer
      - batch
      - frame sync
      - flush
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_event_and_message_system_network_protocol_and_sync_q8
  question: 未知协议、解包失败、消息乱序、重连补包或重复推送到达时，事件系统如何兜底，是否有统一告警和丢弃策略？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/net/
      - assets/network/
      - assets/framework/
      - assets/scripts/
      - native/
    keywords:
      - unknown
      - duplicate
      - retry
      - warning
      - discard
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_event_and_message_system_network_protocol_and_sync_q9
  question: 网络状态变化是否会被转换为全局事件驱动 UI、玩法和平台层联动，例如掉线弹窗、重连态、战斗暂停和恢复？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/ui/
      - assets/battle/
      - assets/net/
      - assets/scripts/
      - assets/framework/
    keywords:
      - reconnect
      - offline
      - pause
      - resume
      - popup
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_event_and_message_system_network_protocol_and_sync_q10
  question: 是否存在协议到事件处理链路的调试工具，例如打印协议号、事件名、分发顺序、耗时和监听者列表，方便排查错序或漏处理？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/framework/
      - assets/net/
      - assets/scripts/
      - tools/
      - extensions/
    keywords:
      - debug
      - trace
      - log
      - listener
      - event panel
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
