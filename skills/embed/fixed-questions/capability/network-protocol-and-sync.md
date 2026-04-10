---
name: fixed-questions-capability-network-protocol-and-sync
description: 网络协议与同步 固定问题模板
matrix_id: capability.network_protocol_and_sync
axis: capability
capability: network_protocol_and_sync
capability_id: network_protocol_and_sync
owner: researcher-infra
question_set_id: qs-common-network-protocol-and-sync
scope:
  - agent-inject
---

## 填写说明

- 本文件是 capability.network_protocol_and_sync 的固定问题模板。
- 补充网络协议、传输层、同步框架和异常处理上的固定问题。
- 后续填写时，只写该 capability 自己必须回答的问题，不要把引擎主线问题写进来。

## 固定问题

- id: capability_network_protocol_and_sync_q1
  question: 项目的网络传输层入口在哪里，使用 TCP、UDP、KCP、WebSocket、HTTP 还是引擎内建同步框架？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `Assets/`
      - `Scripts/`
      - `src/`
      - `Runtime/`
      - `server/`
      - `fastapi/`
    keywords:
      - `Socket`
      - `TCP`
      - `UDP`
      - `KCP`
      - `WebSocket`
      - `HTTP`
      - `MultiplayerAPI`
      - `Netcode`
      - `Mirror`
      - `Replication`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_network_protocol_and_sync_q2
  question: 协议包的帧格式、长度头、消息头、序列化格式和解包入口在哪里定义？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `Assets/`
      - `Scripts/`
      - `src/`
      - `Runtime/`
      - `server/`
      - `proto/`
      - `protocol/`
    keywords:
      - `Packet`
      - `Header`
      - `Length`
      - `Serialize`
      - `Deserialize`
      - `msgpack`
      - `protobuf`
      - `Pack`
      - `Unpack`
      - `Resolver`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_network_protocol_and_sync_q3
  question: 协议号、消息 ID、请求/响应结构或事件名在哪里登记和维护？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `Assets/`
      - `Scripts/`
      - `src/`
      - `Runtime/`
      - `proto/`
      - `protocol/`
      - `network/`
    keywords:
      - `msgid`
      - `message_id`
      - `opcode`
      - `protocol`
      - `proto`
      - `request`
      - `response`
      - `send`
      - `recv`
      - `net`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_network_protocol_and_sync_q4
  question: 客户端发送消息的统一封装 API 在哪里，业务层是否通过 net 模块、Service 或 Manager 调用？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `Assets/`
      - `Scripts/`
      - `src/`
      - `Runtime/`
      - `network/`
      - `net/`
    keywords:
      - `Send`
      - `SendMsg`
      - `send`
      - `SocketManager`
      - `NetManager`
      - `NetworkManager`
      - `Service`
      - `net`
      - `request`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_network_protocol_and_sync_q5
  question: 收包、解包、路由分发和业务回调的主路径在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `Assets/`
      - `Scripts/`
      - `src/`
      - `Runtime/`
      - `server/`
      - `network/`
      - `net/`
    keywords:
      - `Receive`
      - `Recv`
      - `OnMessage`
      - `Dispatch`
      - `Handle`
      - `Callback`
      - `Resolver`
      - `Unpack`
      - `route`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_network_protocol_and_sync_q6
  question: 项目是否存在状态同步、实体同步、房间同步、帧同步或复制系统，核心入口在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `Assets/`
      - `Scripts/`
      - `src/`
      - `Runtime/`
      - `server/`
      - `network/`
    keywords:
      - `sync`
      - `replicate`
      - `snapshot`
      - `frame`
      - `room`
      - `entity`
      - `state`
      - `prediction`
      - `rollback`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_network_protocol_and_sync_q7
  question: 心跳、重连、断线恢复、超时和网络状态切换逻辑写在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `Assets/`
      - `Scripts/`
      - `src/`
      - `Runtime/`
      - `server/`
      - `network/`
    keywords:
      - `Heartbeat`
      - `Ping`
      - `Pong`
      - `Reconnect`
      - `Disconnect`
      - `Timeout`
      - `Retry`
      - `KeepAlive`
      - `NetworkState`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_network_protocol_and_sync_q8
  question: 登录鉴权、会话 token、签名、加密或压缩是否进入协议层，相关处理入口在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `Assets/`
      - `Scripts/`
      - `src/`
      - `Runtime/`
      - `server/`
      - `network/`
      - `auth/`
    keywords:
      - `login`
      - `auth`
      - `token`
      - `session`
      - `sign`
      - `encrypt`
      - `decrypt`
      - `compress`
      - `gzip`
      - `ssl`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_network_protocol_and_sync_q9
  question: 网络错误码、异常处理、日志上报和协议兼容保护由哪里统一处理？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `Assets/`
      - `Scripts/`
      - `src/`
      - `Runtime/`
      - `server/`
      - `network/`
    keywords:
      - `Error`
      - `Exception`
      - `Log`
      - `Code`
      - `Fail`
      - `Retry`
      - `Version`
      - `Compatible`
      - `ProtocolError`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_network_protocol_and_sync_q10
  question: 本地模拟服务器、网络调试工具、协议测试或录包回放入口是否存在，和正式链路如何区分？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `server/`
      - `fastapi/`
      - `mock/`
      - `Tools/`
      - `Editor/`
      - `Tests/`
      - `Assets/`
    keywords:
      - `mock`
      - `local`
      - `server`
      - `debug`
      - `replay`
      - `record`
      - `test`
      - `simulator`
      - `fastapi`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
