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
  question: TODO
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths: []
    keywords: []
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_network_protocol_and_sync_q2
  question: TODO
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths: []
    keywords: []
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_network_protocol_and_sync_q3
  question: TODO
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths: []
    keywords: []
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
