---
name: fixed-questions-engine-unreal-event-and-message-system
description: unreal / 事件与消息系统 固定问题模板
matrix_id: engine.unreal.event_and_message_system
axis: engine
engine: unreal
direction_id: event_and_message_system
owner: researcher-unreal
question_set_id: qs-unreal-event-and-message-system
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unreal.event_and_message_system 的固定问题模板。
- 补充该引擎事件、消息和模块通信方式上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 	axonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: unreal_event_and_message_system_q1
  question: 项目模块通信的主通道是什么，是否以 `Delegate / Multicast Delegate` 作为主要事件机制？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "DECLARE_DELEGATE"
      - "DECLARE_MULTICAST_DELEGATE"
      - "AddLambda"
      - "Broadcast("
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_event_and_message_system_q2
  question: 是否存在 `Gameplay Message Subsystem`、`Gameplay Tag` 消息或 `Gameplay Ability System` 事件通道？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "*.uproject"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "GameplayMessageSubsystem"
      - "GameplayTag"
      - "SendGameplayEventToActor"
      - "AbilitySystemComponent"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_event_and_message_system_q3
  question: Blueprint 层事件通信是否依赖 `BlueprintAssignable`、Event Dispatcher 或 Blueprint Interface？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Content/**/BP_*"
      - "Content/**/WBP_*"
    keywords:
      - "BlueprintAssignable"
      - "Event Dispatcher"
      - "Blueprint Interface"
      - "UINTERFACE"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_event_and_message_system_q4
  question: 网络事件是否主要通过 `RPC`、`NetMulticast`、`Client` / `Server` 函数与 `OnRep_` 回调传播？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "UFUNCTION(Server"
      - "UFUNCTION(Client"
      - "NetMulticast"
      - "OnRep_"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_event_and_message_system_q5
  question: 是否有专门的 `Subsystem / Manager / Bus` 负责汇聚跨模块消息，而不是到处直接互相引用？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Subsystem*"
      - "Source/**/*Manager*"
      - "Source/**/*Bus*"
    keywords:
      - "Subsystem"
      - "Manager"
      - "Bus"
      - "Message"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_event_and_message_system_q6
  question: GAS、动画、UI 或输入系统之间是否通过 Gameplay Tag / Gameplay Event 连接，而不是硬编码函数调用？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Config/*.ini"
    keywords:
      - "GameplayTag"
      - "GameplayEvent"
      - "AbilityTag"
      - "InputTag"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_event_and_message_system_q7
  question: 异步加载、任务完成和平台回调是否统一回到 Game Thread 再派发业务事件？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Plugins/**/*.cpp"
    keywords:
      - "AsyncTask(ENamedThreads::GameThread"
      - "Broadcast("
      - "ExecuteIfBound"
      - "OnComplete"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_event_and_message_system_q8
  question: 跨系统解耦更常使用接口、委托还是直接持有对象引用，边界证据在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "UINTERFACE"
      - "TScriptInterface"
      - "DECLARE_MULTICAST_DELEGATE"
      - "UPROPERTY()"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_event_and_message_system_q9
  question: 委托绑定和解绑是否有统一规范，能否定位 `AddUObject / AddDynamic / RemoveAll / Remove` 的清理逻辑？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Source/**/*.h"
    keywords:
      - "AddUObject"
      - "AddDynamic"
      - "RemoveAll"
      - "Remove("
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_event_and_message_system_q10
  question: 日志、分析埋点、错误通知或在线事件是否复用了统一消息系统，而不是各自独立上报？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Source/**/*.h"
      - "Plugins/**/*.cpp"
    keywords:
      - "Analytics"
      - "Telemetry"
      - "Event"
      - "Log"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
