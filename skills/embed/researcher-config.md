---
name: embed-researcher-config
description: /seed:embed 配置能力 researcher 扫描剧本
triggers:
  - embed config researcher
  - config scan
  - data pipeline scan
domain:
  - project-analysis
scope:
  - agent-inject
---

## 加载顺序

创建 `researcher-config` 前，必须先加载：

1. `$CLAUDE_PLUGIN_ROOT/skills/embed/researcher-common.md`
2. `$CLAUDE_PLUGIN_ROOT/skills/embed/taxonomy-registry.md`
3. `$CLAUDE_PLUGIN_ROOT/skills/embed/researcher-config.md`

`researcher-config` 不加载 `researcher-runtime-common.md`。

## TaskCreate 模板

```text
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: 数据配置能力调查报告；写入 `.seed/state/embed/<embed_stamp>/reports/researcher-config.yaml`（原子写）；写完后 SendMessage 通知 leader 路径 + 状态摘要
Done Definition: 报告输出通用规则执行结果、运行时必查项结果 N/A、capability.data_config_pipeline 领域发现以及 fixed_question_results；每条结论和固定问题回答都附证据路径
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目配置表、Schema、导表与校验流程，为生成 common-data-config-pipeline.md 提供依据
Scope Coverage: data_config_pipeline
Exclusions: 引擎主线方向、Lua、网络、CI/CD、工具链
```

## 扫描剧本

### 数据源与产物

- 搜索 `*.xlsx`、`*.xls`、`*.csv`、`*.json`、`*.yaml`、`*.proto`、`*.fbs`、`*.bytes`
- 关注数据源目录、导出目录、运行时消费目录
- 不要因为有零散 JSON 就断言配置方案是 JSON

### 导表 / Schema / 校验

- 搜索 `ExcelExport`、`TableExport`、`GenerateConfig`、`ProtoGen`、`Flatc`
- 搜索解析器、Schema 定义、字段校验脚本、CI 中的数据检查步骤
- 只有定位到真实 schema 或导出入口，才能写字段和流程约定

### 文档与评审模板

- 搜索 `doc/`、`docs/`、`design/`、`策划/`、`文档/`
- 记录配置文档模板、评审模板、数据变更流程说明

## 输出要求

- 报告第二段固定写：`运行时必查项结果：N/A（data_config_pipeline 不适用）`
- 只服务 `common-data-config-pipeline.md`
