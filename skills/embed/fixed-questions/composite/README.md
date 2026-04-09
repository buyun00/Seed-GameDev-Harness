---
name: embed-fixed-questions-composite-readme
description: /seed:embed composite 交叉固定问题模板的预制范围与选择规则
domain:
  - project-analysis
scope:
  - agent-inject
---

# Composite Fixed Questions

本目录用于存放 `engine direction x capability` 的交叉固定问题模板。

## 选择规则

- 只预制高耦合、常出现、漏查代价高的组合。
- 只在交叉后会新增稳定必查问题时，才创建 composite 模板。
- 不做全量笛卡尔积，不重复 base engine / base capability 已覆盖的问题。
- 运行时只加载已存在的 composite 文件，不临时发明新问题。

## 本轮已预制的组合范围

- `lua_embedding`
  - 所有引擎先预制 `script_layer`、`bridge_layer`
  - `unity`、`cocos` 额外预制 `hot_reload`
- `data_config_pipeline`
  - 所有引擎预制 `asset_pipeline`、`project_structure`
- `network_protocol_and_sync`
  - 所有引擎预制 `event_and_message_system`
  - 所有引擎预制 `physics_navigation_or_runtime_framework`
- `build_release_and_cicd`
  - 所有引擎预制 `asset_pipeline`
  - `unity`、`unreal`、`cocos` 额外预制 `hot_reload`

## 当前不预制的类型

- 只是重复 base 问题的组合
- 很难形成稳定搜索模式的组合
- 低频、弱耦合、主要依赖具体项目命名习惯的组合

其余 composite 仍按需补充。
