---
name: fixed-questions-composite-godot-event-and-message-system-network-protocol-and-sync
description: godot / event-and-message-system x network-protocol-and-sync 交叉固定问题模板
composite_id: composite.godot.event_and_message_system.network_protocol_and_sync
axis: composite
engine: godot
direction_id: event_and_message_system
capability: network_protocol_and_sync
capability_id: network_protocol_and_sync
owner: builder-engine
researcher_owner: researcher-godot
capability_owner: researcher-infra
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.godot.event_and_message_system.network_protocol_and_sync` 的交叉固定问题模板。
- 这里只补 `engine.godot.event_and_message_system` 与 `capability.network_protocol_and_sync` 叠加后新增的必查问题。
- 不重复 `fixed-questions/engine/godot/event-and-message-system.md` 和 `fixed-questions/capability/network-protocol-and-sync.md` 已覆盖的基础问题。
- 每条问题都单独给出 `search_hints.paths` 与 `search_hints.keywords`，目录 hint 已下沉到问题级别。

## 固定问题

- id: godot_event_and_message_system_network_protocol_and_sync_q1
  question: 项目是否把 `SceneMultiplayer`、peer 生命周期和 RPC 回调统一转成内部 signal 或 event bus 消息，而不是让业务节点直接散落处理网络回调？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - autoload/
      - events/
      - network/
      - multiplayer/
      - systems/
      - "*.gd"
    keywords:
      - SceneMultiplayer
      - EventBus
      - signal
      - rpc
      - peer_connected
      - peer_disconnected
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_event_and_message_system_network_protocol_and_sync_q2
  question: `peer_connected`、`peer_disconnected`、`connected_to_server`、`server_disconnected`、连接失败等网络事件是在哪个全局节点或中间层被收口并二次分发的？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - autoload/
      - network/
      - multiplayer/
      - systems/
      - "*.gd"
      - "*.tscn"
    keywords:
      - peer_connected
      - peer_disconnected
      - connected_to_server
      - server_disconnected
      - connection_failed
      - emit_signal
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_event_and_message_system_network_protocol_and_sync_q3
  question: 业务层收到网络输入时，是直接进入 `@rpc` 或 `rpc()` 方法，还是先被适配成内部命令、领域事件或消息对象再分发？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - network/
      - multiplayer/
      - gameplay/
      - systems/
      - "*.gd"
      - autoload/
    keywords:
      - @rpc
      - rpc(
      - rpc_id(
      - command
      - event
      - message
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_event_and_message_system_network_protocol_and_sync_q4
  question: 本地单机事件路径与联机同步事件路径是否复用同一套事件接口，例如本地输入和远端同步最终都进入同一个 bus 或 dispatcher？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - input/
      - events/
      - network/
      - systems/
      - autoload/
      - "*.gd"
    keywords:
      - EventBus
      - dispatcher
      - input
      - message
      - signal
      - multiplayer
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_event_and_message_system_network_protocol_and_sync_q5
  question: `MultiplayerSpawner` 产生的出生、销毁、可见性变化和 authority 切换，是否会被显式翻译成上层消息事件供 UI、系统层或玩法层订阅？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - multiplayer/
      - network/
      - ui/
      - systems/
      - "*.gd"
      - "*.tscn"
    keywords:
      - MultiplayerSpawner
      - visibility
      - authority
      - spawn
      - despawn
      - emit_signal
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_event_and_message_system_network_protocol_and_sync_q6
  question: 网络消息的可靠性、顺序语义和频道划分，是否体现在消息命名、路由层或 RPC 包装器中，而不是靠调用方隐式记忆？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - network/
      - multiplayer/
      - protocol/
      - events/
      - "*.gd"
      - "*.cs"
    keywords:
      - unreliable
      - reliable
      - ordered
      - channel
      - transfer_mode
      - rpc_config
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_event_and_message_system_network_protocol_and_sync_q7
  question: 收包后的反序列化、校验失败、重复包、超时、断线重连和错误回调，最终是否都会落到统一的内部异常事件或状态消息流？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - network/
      - protocol/
      - reconnect/
      - autoload/
      - "*.gd"
      - logs/
    keywords:
      - timeout
      - reconnect
      - deserialize
      - validation
      - duplicate
      - error
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_event_and_message_system_network_protocol_and_sync_q8
  question: 是否存在专门的网络事件 facade，把 Godot 自带 multiplayer API 的 signal、RPC 适配为项目自定义的消息协议层？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - autoload/
      - network/
      - protocol/
      - systems/
      - "*.gd"
      - "*.cs"
    keywords:
      - facade
      - wrapper
      - adapter
      - SceneMultiplayer
      - rpc
      - signal
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_event_and_message_system_network_protocol_and_sync_q9
  question: 跨场景、跨系统的网络消息订阅在节点销毁、场景切换和重连时如何解除绑定，避免遗留无效 signal 连接或重复订阅？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - events/
      - network/
      - autoload/
      - scenes/
      - "*.gd"
      - systems/
    keywords:
      - disconnect
      - is_connected
      - tree_exited
      - scene_changed
      - reconnect
      - signal
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_event_and_message_system_network_protocol_and_sync_q10
  question: 网络调试日志、事件 tracing、消息录制或回放工具是否与现有事件系统整合，能够从 bus 层定位同步问题？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - debug/
      - logs/
      - network/
      - events/
      - tools/
      - "*.gd"
    keywords:
      - trace
      - replay
      - record
      - debug
      - log
      - EventBus
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
