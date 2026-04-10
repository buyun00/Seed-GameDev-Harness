---
name: embed-researcher-infra
description: /seed:embed 基础设施 capability researcher 扫描剧本
triggers:
  - embed infra researcher
  - infrastructure scan
  - network cicd tooling scan
domain:
  - project-analysis
scope:
  - agent-inject
---

## 加载顺序

创建 `researcher-infra` 前，必须先加载：

1. `$CLAUDE_PLUGIN_ROOT/skills/embed/researcher-common.md`
2. `$CLAUDE_PLUGIN_ROOT/skills/embed/taxonomy-registry.md`
3. `$CLAUDE_PLUGIN_ROOT/skills/embed/researcher-infra.md`

`researcher-infra` 不加载 `researcher-runtime-common.md`。

## TaskCreate 模板

```text
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: 单个基础设施 capability 矩阵项调查报告；写入 `.seed/state/embed/<embed_stamp>/reports/<matrix_id>.yaml`（原子写）；写完后 SendMessage 通知 leader 路径 + matrix_id + 状态摘要
Done Definition: 报告按 researcher-common 的单矩阵格式输出；顶层 matrix_id/output_file/fixed_question_file 与 matrix_job 完全一致；运行时固定问题结果 N/A；仅覆盖当前 capability_id；每条结论和固定问题回答都附证据路径
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目跨引擎基础设施能力，为生成 common-network-protocol-and-sync.md、common-build-release-and-cicd.md、common-tooling-and-ai-pipeline.md 提供依据
Scope Coverage: network_protocol_and_sync, build_release_and_cicd, tooling_and_ai_pipeline
Exclusions: 引擎主线方向、Lua、配置表
```

## 单矩阵任务约束

- 本文件是 infra researcher profile，不代表一次任务要扫描全部 infra capabilities。
- TaskCreate 必须提供唯一 `matrix_job`；本 researcher 只调查 `capability.network_protocol_and_sync`、`capability.build_release_and_cicd` 或 `capability.tooling_and_ai_pipeline` 中的当前一个。
- 报告文件必须写到 `matrix_job.report_file`，不得写 profile-level 聚合报告。
- `domain_findings` 与 `fixed_question_results` 只能包含当前 `matrix_id`；其它能力线索只能写入 `handoff_notes`，且不得写出其它 `engine.*.*` / `capability.*` 矩阵 ID。
- 只加载当前 `fixed_question_file` 与匹配 composite fixed question 文件。

## 扫描剧本

### 网络协议与同步

- 搜索 `Socket`、`KCP`、`TCP`、`UDP`、`WebSocket`、`Protobuf`、`Mirror`、`Netcode`
- 搜索 Godot `MultiplayerAPI`、Unreal replication/network subsystem、自研传输层
- 必须追到协议定义、封装 API 或发送/接收入口

### 构建发布与 CI/CD

- 搜索 `.github/workflows/`、`.gitlab-ci.yml`、`Jenkinsfile`
- 搜索 build/release/hotupdate 脚本、Unity build pipeline、Godot export、Unreal UAT、Cocos build script
- 关注从构建到发布的完整链路，不只看单个 workflow 文件名

### 工具链与 AI pipeline

- 搜索 `.mcp.json`、项目根目录 `.seed/` 是否存在、`mcp`、`agent`、`pipeline`
- `.seed/` 只作为 Seed 工具链存在性证据，不得递归读取 `.seed/skills/`、`.seed/state/`、`.seed/logs/`、`.seed/plans/` 中的内容来判断 Lua、配置、网络、构建或引擎能力
- 搜索 custom tooling、editor tools、自动化脚本入口
- 只记录项目级工具链，不把引擎自带工具当项目能力

## 输出要求

- 报告第二段固定写：`运行时固定问题结果：N/A（infra capabilities 不直接承担引擎运行时主线固定问题）`
- `asset_pipeline` 不归 `researcher-infra`，发现相关证据只作为旁注交给对应引擎 researcher
