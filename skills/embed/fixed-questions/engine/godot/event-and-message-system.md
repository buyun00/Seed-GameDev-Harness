---
name: fixed-questions-engine-godot-event-and-message-system
description: godot / 事件与消息系统 固定问题模板
matrix_id: engine.godot.event_and_message_system
axis: engine
engine: godot
direction_id: event_and_message_system
owner: researcher-godot
question_set_id: qs-godot-event-and-message-system
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.godot.event_and_message_system 的固定问题模板。
- 补充该引擎事件分发、模块通信和消息总线上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: godot_event_and_message_system_q1
  question: 模块/系统之间主要靠 signal、autoload event bus 还是直接引用调用？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `autoload/`
      - `events/`
      - `systems/`
      - `*.gd`
      - `*.tscn`
    keywords:
      - `signal`
      - `connect(`
      - `emit_signal`
      - `Callable`
      - `call_deferred`
      - `add_to_group`
      - `call_group`
      - `EventBus`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_event_and_message_system_q2
  question: 全局事件中心如果存在，入口节点或脚本在哪里初始化？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `autoload/`
      - `events/`
      - `systems/`
      - `*.gd`
      - `*.tscn`
    keywords:
      - `signal`
      - `connect(`
      - `emit_signal`
      - `Callable`
      - `call_deferred`
      - `add_to_group`
      - `call_group`
      - `EventBus`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_event_and_message_system_q3
  question: 事件是用 `signal` 声明加 `connect()`，还是统一封装成 dispatcher / bus API？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `autoload/`
      - `events/`
      - `systems/`
      - `*.gd`
      - `*.tscn`
    keywords:
      - `signal`
      - `connect(`
      - `emit_signal`
      - `Callable`
      - `call_deferred`
      - `add_to_group`
      - `call_group`
      - `EventBus`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_event_and_message_system_q4
  question: 跨场景或跨 UI / gameplay 模块通信时，谁负责中转和解耦？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `autoload/`
      - `events/`
      - `systems/`
      - `*.gd`
      - `*.tscn`
    keywords:
      - `signal`
      - `connect(`
      - `emit_signal`
      - `Callable`
      - `call_deferred`
      - `add_to_group`
      - `call_group`
      - `EventBus`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_event_and_message_system_q5
  question: `Callable`、`call_deferred()`、group broadcast 在项目里各自承担什么角色？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `autoload/`
      - `events/`
      - `systems/`
      - `*.gd`
      - `*.tscn`
    keywords:
      - `signal`
      - `connect(`
      - `emit_signal`
      - `Callable`
      - `call_deferred`
      - `add_to_group`
      - `call_group`
      - `EventBus`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_event_and_message_system_q6
  question: 事件订阅的生命周期如何管理，避免节点销毁后留下悬挂连接？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `autoload/`
      - `events/`
      - `systems/`
      - `*.gd`
      - `*.tscn`
    keywords:
      - `signal`
      - `connect(`
      - `emit_signal`
      - `Callable`
      - `call_deferred`
      - `add_to_group`
      - `call_group`
      - `EventBus`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_event_and_message_system_q7
  question: 请求/响应、命令式调用和广播消息在代码里如何区分？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `autoload/`
      - `events/`
      - `systems/`
      - `*.gd`
      - `*.tscn`
    keywords:
      - `signal`
      - `connect(`
      - `emit_signal`
      - `Callable`
      - `call_deferred`
      - `add_to_group`
      - `call_group`
      - `EventBus`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_event_and_message_system_q8
  question: 编辑器连接的 signal 与运行时代码连接的 signal 各在哪里定义？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `autoload/`
      - `events/`
      - `systems/`
      - `*.gd`
      - `*.tscn`
    keywords:
      - `signal`
      - `connect(`
      - `emit_signal`
      - `Callable`
      - `call_deferred`
      - `add_to_group`
      - `call_group`
      - `EventBus`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_event_and_message_system_q9
  question: 平台、网络或桥接回调进入业务层后，是否统一转成内部事件消息？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `autoload/`
      - `events/`
      - `systems/`
      - `*.gd`
      - `*.tscn`
    keywords:
      - `signal`
      - `connect(`
      - `emit_signal`
      - `Callable`
      - `call_deferred`
      - `add_to_group`
      - `call_group`
      - `EventBus`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_event_and_message_system_q10
  question: 事件命名、调试日志和 tracing 是否有统一约定？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `autoload/`
      - `events/`
      - `systems/`
      - `*.gd`
      - `*.tscn`
    keywords:
      - `signal`
      - `connect(`
      - `emit_signal`
      - `Callable`
      - `call_deferred`
      - `add_to_group`
      - `call_group`
      - `EventBus`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
