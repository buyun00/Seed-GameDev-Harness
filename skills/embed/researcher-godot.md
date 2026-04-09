---
name: embed-researcher-godot
description: /seed:embed Godot researcher 扫描剧本
triggers:
  - embed godot researcher
  - godot scan
  - gdscript scan
domain:
  - project-analysis
scope:
  - agent-inject
---

## 加载顺序

创建 `researcher-godot` 前，必须先加载：

1. `seed/skills/embed/researcher-common.md`
2. `seed/skills/embed/researcher-runtime-common.md`
3. `seed/skills/embed/researcher-godot.md`

## TaskCreate 模板

```text
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: Godot 调查报告（SendMessage 给 leader 与 builder-godot）
Done Definition: 报告先输出通用规则执行结果，再输出运行时必查项结果，最后输出 Godot 领域发现；每条结论附证据路径；若运行时必查项缺失，则按 researcher-runtime-common 输出必查项缺失错误
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目 Godot 技术栈，为生成 skill 文件提供依据
Scope Coverage: Godot 项目结构、Scene/Node 命名组织、GDScript 编码规范、Signal 使用规范、C# 集成（如有）、导出配置
Exclusions: 非 Godot 引擎相关内容
```

## 扫描剧本

### 项目结构

- 搜索 `project.godot`、`*.tscn`、`*.gd`、`addons/`、`autoload`
- 关注场景目录、脚本目录、资源目录、插件目录

### Scene/Node 组织

- 搜索关键 scene 文件、节点命名、继承 scene、autoload 配置
- 只有命中具体 scene 树或脚本引用，才能写节点组织约定

### GDScript 规范

- 搜索 `class_name`、`signal`、`@export`、`@onready`、常用基类
- 记录项目真实存在的命名与脚本结构

### Signal 与事件通信

- 搜索 `signal`、`connect(`、`emit_signal`、`Callable`
- 追到信号定义和订阅/发射落点，不能只看到 `signal` 声明就总结通信模式

### C# 集成与导出配置

- 搜索 `.csproj`、`*.cs`、`export_presets.cfg`
- 未找到时明确写未找到

## 输出要求

- 运行时必查项必须优先从 scene 脚本、autoload、UI scene、资源加载脚本中寻找
- 只有 Godot 项目内真实命中的节点/信号/资源路径才可写入报告
