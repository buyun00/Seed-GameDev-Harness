---
name: fixed-questions-engine-godot-bridge-layer
description: godot / 桥接层 固定问题模板
matrix_id: engine.godot.bridge_layer
axis: engine
engine: godot
direction_id: bridge_layer
owner: researcher-godot
question_set_id: qs-godot-bridge-layer
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.godot.bridge_layer 的固定问题模板。
- 补充该引擎与宿主平台、原生模块、脚本层之间桥接关系上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: godot_bridge_layer_q1
  question: 项目是否存在显式桥接层，例如 GDExtension、GDNative、C# bridge 或平台插件封装？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `addons/`
      - `android/`
      - `ios/`
      - `*.gdextension`
      - `*.cpp`
      - `*.h`
      - `*.cs`
    keywords:
      - `GDExtension`
      - `GDNative`
      - `register_types`
      - `JNISingleton`
      - `Callable`
      - `Engine.has_singleton`
      - `native`
      - `bridge`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_bridge_layer_q2
  question: 桥接入口和注册文件写在哪里，例如 `*.gdextension`、`register_types.cpp` 或插件初始化脚本？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `addons/`
      - `android/`
      - `ios/`
      - `*.gdextension`
      - `*.cpp`
      - `*.h`
      - `*.cs`
    keywords:
      - `GDExtension`
      - `GDNative`
      - `register_types`
      - `JNISingleton`
      - `Callable`
      - `Engine.has_singleton`
      - `native`
      - `bridge`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_bridge_layer_q3
  question: GDScript 或 C# 调原生 SDK / 系统 API 的统一入口是什么？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `addons/`
      - `android/`
      - `ios/`
      - `*.gdextension`
      - `*.cpp`
      - `*.h`
      - `*.cs`
    keywords:
      - `GDExtension`
      - `GDNative`
      - `register_types`
      - `JNISingleton`
      - `Callable`
      - `Engine.has_singleton`
      - `native`
      - `bridge`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_bridge_layer_q4
  question: 原生层回调返回 Godot 时，是通过 signal、Callable、事件总线还是直接调用节点方法？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `addons/`
      - `android/`
      - `ios/`
      - `*.gdextension`
      - `*.cpp`
      - `*.h`
      - `*.cs`
    keywords:
      - `GDExtension`
      - `GDNative`
      - `register_types`
      - `JNISingleton`
      - `Callable`
      - `Engine.has_singleton`
      - `native`
      - `bridge`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_bridge_layer_q5
  question: 自定义类型、资源路径、字典/数组等跨边界数据是如何转换和封装的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `addons/`
      - `android/`
      - `ios/`
      - `*.gdextension`
      - `*.cpp`
      - `*.h`
      - `*.cs`
    keywords:
      - `GDExtension`
      - `GDNative`
      - `register_types`
      - `JNISingleton`
      - `Callable`
      - `Engine.has_singleton`
      - `native`
      - `bridge`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_bridge_layer_q6
  question: 原生动态库、绑定代码和脚本包装层分别放在哪些目录？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `addons/`
      - `android/`
      - `ios/`
      - `*.gdextension`
      - `*.cpp`
      - `*.h`
      - `*.cs`
    keywords:
      - `GDExtension`
      - `GDNative`
      - `register_types`
      - `JNISingleton`
      - `Callable`
      - `Engine.has_singleton`
      - `native`
      - `bridge`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_bridge_layer_q7
  question: 桥接层是运行时能力、编辑器能力，还是两者都有？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `addons/`
      - `android/`
      - `ios/`
      - `*.gdextension`
      - `*.cpp`
      - `*.h`
      - `*.cs`
    keywords:
      - `GDExtension`
      - `GDNative`
      - `register_types`
      - `JNISingleton`
      - `Callable`
      - `Engine.has_singleton`
      - `native`
      - `bridge`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_bridge_layer_q8
  question: 平台差异是通过统一 facade、条件编译还是按平台插件分目录处理？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `addons/`
      - `android/`
      - `ios/`
      - `*.gdextension`
      - `*.cpp`
      - `*.h`
      - `*.cs`
    keywords:
      - `GDExtension`
      - `GDNative`
      - `register_types`
      - `JNISingleton`
      - `Callable`
      - `Engine.has_singleton`
      - `native`
      - `bridge`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_bridge_layer_q9
  question: 桥接失败、平台不可用或 ABI 不匹配时的降级逻辑写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `addons/`
      - `android/`
      - `ios/`
      - `*.gdextension`
      - `*.cpp`
      - `*.h`
      - `*.cs`
    keywords:
      - `GDExtension`
      - `GDNative`
      - `register_types`
      - `JNISingleton`
      - `Callable`
      - `Engine.has_singleton`
      - `native`
      - `bridge`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_bridge_layer_q10
  question: 桥接层向业务层暴露的 public API 在哪里被集中声明和使用？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `addons/`
      - `android/`
      - `ios/`
      - `*.gdextension`
      - `*.cpp`
      - `*.h`
      - `*.cs`
    keywords:
      - `GDExtension`
      - `GDNative`
      - `register_types`
      - `JNISingleton`
      - `Callable`
      - `Engine.has_singleton`
      - `native`
      - `bridge`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
