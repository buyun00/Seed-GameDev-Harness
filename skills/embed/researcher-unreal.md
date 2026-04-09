---
name: embed-researcher-unreal
description: /seed:embed Unreal researcher 扫描剧本
triggers:
  - embed unreal researcher
  - unreal scan
  - blueprint scan
domain:
  - project-analysis
scope:
  - agent-inject
---

## 加载顺序

创建 `researcher-unreal` 前，必须先加载：

1. `seed/skills/embed/researcher-common.md`
2. `seed/skills/embed/researcher-runtime-common.md`
3. `seed/skills/embed/researcher-unreal.md`

## TaskCreate 模板

```text
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: Unreal 调查报告（SendMessage 给 leader 与 builder-unreal）
Done Definition: 报告先输出通用规则执行结果，再输出运行时必查项结果，最后输出 Unreal 领域发现；每条结论附证据路径；若运行时必查项缺失，则按 researcher-runtime-common 输出必查项缺失错误
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目 Unreal 技术栈，为生成 skill 文件提供依据
Scope Coverage: Unreal 项目结构、Blueprint 命名组织、C++ 编码规范和模块划分、GameMode/GameState/PlayerController 使用约定、插件使用
Exclusions: 非 Unreal 引擎相关内容
```

## 扫描剧本

### 项目结构与模块

- 搜索 `*.uproject`、`Source/`、`Content/`、`Config/`、`Plugins/`
- 记录模块划分、蓝图资产目录、插件目录

### Blueprint 约定

- 搜索 `Content/` 下资产命名、蓝图基类命名、相关文档/脚本
- 仅在找到实际蓝图资产组织证据时总结命名规范

### C++ 规范与 Gameplay Framework

- 搜索 `GameMode`、`GameState`、`PlayerController`、`Subsystem`、`ActorComponent`
- 关注类定义与实际使用点，不要只因存在模板类就总结架构约定

### UI / 资源 / 场景

- 搜索 `Widget`、`UMG`、`Level`、`Map`、`Stream`、`AssetManager`
- 必查项要优先追到 widget 打开、关卡切换、资源加载释放的项目实现

### 插件使用

- 搜索 `Plugins/`、`.uplugin`、模块引用
- 只记录项目内实际使用的插件

## 输出要求

- 如果蓝图资产无法直接读到逻辑，必须明确说明“仅能确认资产存在，无法从当前可读内容确认内部实现”
- 不得把 Unreal 常见做法写成项目已采用的约定
