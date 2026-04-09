---
name: embed-researcher-config
description: /seed:embed 配置/策划 researcher 扫描剧本
triggers:
  - embed config researcher
  - config scan
  - design doc scan
domain:
  - project-analysis
scope:
  - agent-inject
---

## 加载顺序

创建 `researcher-config` 前，必须先加载：

1. `seed/skills/embed/researcher-common.md`
2. `seed/skills/embed/researcher-config.md`

`researcher-config` 不加载 `researcher-runtime-common.md`。

## TaskCreate 模板

```text
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: 配置/策划调查报告（SendMessage 给 leader 与 builder-config）
Done Definition: 报告输出通用规则执行结果与配置/策划领域发现；每条结论附证据路径；不承担运行时 5 项必查
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目配置表和策划文档体系，为生成 skill 文件提供依据
Scope Coverage: 配置表格式和字段约定、数据导出工具链、策划文档规范和模板、数据校验规则
Exclusions: 运行时代码逻辑、Unity 场景配置、网络协议
```

## 扫描剧本

### 配置表格式

- 搜索 `*.xlsx`、`*.xls`、`*.csv`、`*.json`、`*.yaml`、`*.bytes`、`*.proto`、`*.fbs`
- 关注真实的数据源目录、导出产物目录、运行时消费目录
- 不要因为项目里有零散 `json` 文件，就推断“配置表方案是 JSON”

### 导出工具链

- 搜索 `ExcelExport`、`TableExport`、`GenerateConfig`、`ProtoGen`、`Flatc`、导表脚本
- 优先看 `Tools/`、`Editor/`、`Scripts/`、CI 配置中的导表步骤

### 字段与 Schema 约定

- 搜索配置类定义、解析器、反序列化入口、字段校验脚本
- 只有定位到真实 schema 或解析器，才能写字段命名/类型约定

### 策划文档与模板

- 搜索 `doc/`、`docs/`、`design/`、`策划/`、`文档/`、模板文件
- 记录文档模板、目录组织、评审流程脚本或说明文件

### 数据校验

- 搜索 `Validate`、`CheckConfig`、`Lint`、`Schema`、CI 中的数据检查步骤
- 未找到时明确写未找到，不要默认存在校验流程

## 输出要求

- 报告第二段固定写 `运行时必查项结果：N/A（配置/策划方向不适用）`
- 结论必须可回溯到真实配置文件、脚本或文档
