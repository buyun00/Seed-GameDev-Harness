---
name: fixed-questions-composite-unreal-event-and-message-system-network-protocol-and-sync
description: unreal / event-and-message-system x network-protocol-and-sync 交叉固定问题模板
composite_id: composite.unreal.event_and_message_system.network_protocol_and_sync
axis: composite
engine: unreal
direction_id: event_and_message_system
capability: network_protocol_and_sync
capability_id: network_protocol_and_sync
owner: builder-unreal
researcher_owner: researcher-unreal
capability_owner: researcher-infra
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.unreal.event_and_message_system.network_protocol_and_sync` 的交叉固定问题模板。
- 只补充 `engine.unreal.event_and_message_system` 与 `capability.network_protocol_and_sync` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/unreal/event-and-message-system.md` 与 `fixed-questions/capability/network-protocol-and-sync.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。

## 固定问题

- id: unreal_event_and_message_system_network_protocol_and_sync_q1
  question: 事件系统是否明确区分“持久状态同步”和“瞬时事件广播”，前者走属性复制或 `RepNotify`，后者走 RPC、delegate 或消息总线？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - "Source/**/*Net*"
      - "Source/**/*Message*"
      - "Source/**/*Event*"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "ReplicatedUsing"
      - "OnRep_"
      - "NetMulticast"
      - "Broadcast"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_event_and_message_system_network_protocol_and_sync_q2
  question: 项目当前使用的是传统复制系统、`Replication Graph`、`Iris` 还是混合方案，相关开关和初始化入口在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/"
      - "Source/**/*Net*"
      - "Source/**/*Replication*"
      - "*.uproject"
      - "*.uplugin"
    keywords:
      - "Iris"
      - "ReplicationGraph"
      - "NetDriver"
      - "NetObjectPrioritizer"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_event_and_message_system_network_protocol_and_sync_q3
  question: 网络事件的主要承载体是什么，是 Actor、ActorComponent、Replicated Subobject、UObject 包装层，还是 `Online Beacon` 或独立 NetDriver？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Net*"
      - "Source/**/*Beacon*"
      - "Source/**/*Component*"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "ReplicateSubobjects"
      - "OnlineBeacon"
      - "ActorComponent"
      - "CallRemoteFunction"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_event_and_message_system_network_protocol_and_sync_q4
  question: Blueprint 网络事件是否统一通过 replicated custom event、C++ RPC 包装或桥接节点触发，而不是分散随意调用？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Content/**/BP_*"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Plugins/**/*.h"
    keywords:
      - "Run On Server"
      - "Multicast"
      - "UFUNCTION(Server"
      - "BlueprintCallable"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_event_and_message_system_network_protocol_and_sync_q5
  question: 事件顺序、可靠性和所有权边界是否有统一规则，例如哪些消息必须 `Reliable`，哪些只能 `Unreliable`？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Net*"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Docs/"
    keywords:
      - "Reliable"
      - "Unreliable"
      - "OwnerOnly"
      - "Authority"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_event_and_message_system_network_protocol_and_sync_q6
  question: 需要跨网络发送的消息结构是否有统一 `USTRUCT` schema、版本号或字段兼容策略，变更入口在哪里控制？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Message*"
      - "Source/**/*Protocol*"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "USTRUCT"
      - "NetSerialize"
      - "Version"
      - "Protocol"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_event_and_message_system_network_protocol_and_sync_q7
  question: 子对象或组件上的网络事件是否必须通过拥有它的 Actor 转发，是否存在自定义 `GetFunctionCallspace/CallRemoteFunction` 实现？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Net*"
      - "Source/**/*Component*"
      - "Source/**/*.cpp"
      - "Source/**/*.h"
    keywords:
      - "GetFunctionCallspace"
      - "CallRemoteFunction"
      - "ReplicateSubobjects"
      - "AddReplicatedSubObject"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_event_and_message_system_network_protocol_and_sync_q8
  question: 当网络消息引用未加载资源时，项目是否允许异步加载、延迟 RPC，还是要求预加载，相关规则在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/"
      - "Source/**/*Net*"
      - "Source/**/*Asset*"
      - "Source/**/*.cpp"
    keywords:
      - "DelayUnmappedRPCs"
      - "AllowAsyncLoading"
      - "OnSyncLoadDetected"
      - "SoftObjectPath"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_event_and_message_system_network_protocol_and_sync_q9
  question: 事件系统里是否存在非 gameplay 连接通道，例如 `Online Beacon`、会话前握手、后台服务消息或轻量 RPC？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Beacon*"
      - "Source/**/*Online*"
      - "Plugins/**/*Online*"
      - "Source/**/*Session*"
    keywords:
      - "OnlineBeacon"
      - "Handshake"
      - "Session"
      - "Lobby"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_event_and_message_system_network_protocol_and_sync_q10
  question: 同步异常时，项目是否有网络指标、trace、日志或命令行调试手段来定位丢包、乱序、延迟和重复广播问题？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/"
      - "Source/**/*Net*"
      - "Source/**/*Metrics*"
      - "Source/**/*Trace*"
      - "Plugins/"
    keywords:
      - "NetworkMetrics"
      - "Trace"
      - "net."
      - "p.net."
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
