---
name: fixed-questions-engine-godot-native-code-architecture
description: godot / 原生代码架构 固定问题模板
matrix_id: engine.godot.native_code_architecture
axis: engine
engine: godot
direction_id: native_code_architecture
owner: researcher-godot
question_set_id: qs-godot-native-code-architecture
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.godot.native_code_architecture 的固定问题模板。
- 补充该引擎运行时代码组织、职责边界和架构模式上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: godot_native_code_architecture_q1
  question: 运行时核心逻辑以 GDScript、C# 还是混合架构为主？证据在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `*.csproj`
      - `autoload/`
      - `systems/`
      - `services/`
    keywords:
      - `class_name`
      - `await`
      - `Task`
      - `Thread`
      - `Service`
      - `Manager`
      - `push_error`
      - `assert`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_native_code_architecture_q2
  question: 核心系统是按 Manager、Service、Controller、feature module 还是 scene script 组织？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `*.csproj`
      - `autoload/`
      - `systems/`
      - `services/`
    keywords:
      - `class_name`
      - `await`
      - `Task`
      - `Thread`
      - `Service`
      - `Manager`
      - `push_error`
      - `assert`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_native_code_architecture_q3
  question: `class_name`、基类脚本或公共组件如何约束共享行为？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `*.csproj`
      - `autoload/`
      - `systems/`
      - `services/`
    keywords:
      - `class_name`
      - `await`
      - `Task`
      - `Thread`
      - `Service`
      - `Manager`
      - `push_error`
      - `assert`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_native_code_architecture_q4
  question: 异步流程主要用 `await` / signal、`Task` 还是线程/worker 封装？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `*.csproj`
      - `autoload/`
      - `systems/`
      - `services/`
    keywords:
      - `class_name`
      - `await`
      - `Task`
      - `Thread`
      - `Service`
      - `Manager`
      - `push_error`
      - `assert`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_native_code_architecture_q5
  question: 数据配置、资源句柄和业务逻辑之间的依赖是怎么注入的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `*.csproj`
      - `autoload/`
      - `systems/`
      - `services/`
    keywords:
      - `class_name`
      - `await`
      - `Task`
      - `Thread`
      - `Service`
      - `Manager`
      - `push_error`
      - `assert`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_native_code_architecture_q6
  question: 日志、错误处理、断言和调试辅助是否有统一封装？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `*.csproj`
      - `autoload/`
      - `systems/`
      - `services/`
    keywords:
      - `class_name`
      - `await`
      - `Task`
      - `Thread`
      - `Service`
      - `Manager`
      - `push_error`
      - `assert`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_native_code_architecture_q7
  question: scene attached script 与纯逻辑脚本或服务脚本的边界在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `*.csproj`
      - `autoload/`
      - `systems/`
      - `services/`
    keywords:
      - `class_name`
      - `await`
      - `Task`
      - `Thread`
      - `Service`
      - `Manager`
      - `push_error`
      - `assert`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_native_code_architecture_q8
  question: C# 工程若存在，`.csproj`、程序集引用和 Godot 节点脚本如何映射？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `*.csproj`
      - `autoload/`
      - `systems/`
      - `services/`
    keywords:
      - `class_name`
      - `await`
      - `Task`
      - `Thread`
      - `Service`
      - `Manager`
      - `push_error`
      - `assert`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_native_code_architecture_q9
  question: 性能敏感或平台敏感逻辑是否被下沉到 C#、GDExtension 或原生层？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `*.csproj`
      - `autoload/`
      - `systems/`
      - `services/`
    keywords:
      - `class_name`
      - `await`
      - `Task`
      - `Thread`
      - `Service`
      - `Manager`
      - `push_error`
      - `assert`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_native_code_architecture_q10
  question: 工具脚本、测试脚本和运行时代码的目录与依赖边界如何划分？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `*.gd`
      - `*.cs`
      - `*.csproj`
      - `autoload/`
      - `systems/`
      - `services/`
    keywords:
      - `class_name`
      - `await`
      - `Task`
      - `Thread`
      - `Service`
      - `Manager`
      - `push_error`
      - `assert`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
