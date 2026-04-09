---
name: fixed-questions-engine-godot-platform-adaptation
description: godot / 平台适配 固定问题模板
matrix_id: engine.godot.platform_adaptation
axis: engine
engine: godot
direction_id: platform_adaptation
owner: researcher-godot
question_set_id: qs-godot-platform-adaptation
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.godot.platform_adaptation 的固定问题模板。
- 补充该引擎在多平台导出、平台差异和 SDK 接入上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: godot_platform_adaptation_q1
  question: 项目实际支持哪些目标平台？`export_presets.cfg` 和项目配置如何定义它们？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `export_presets.cfg`
      - `project.godot`
      - `android/`
      - `ios/`
      - `web/`
      - `*.gd`
    keywords:
      - `OS.has_feature`
      - `DisplayServer`
      - `safe_area`
      - `android`
      - `ios`
      - `web`
      - `feature`
      - `export`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_platform_adaptation_q2
  question: 平台差异是通过 feature tag、`OS.has_feature()`、条件脚本还是独立目录处理？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `export_presets.cfg`
      - `project.godot`
      - `android/`
      - `ios/`
      - `web/`
      - `*.gd`
    keywords:
      - `OS.has_feature`
      - `DisplayServer`
      - `safe_area`
      - `android`
      - `ios`
      - `web`
      - `feature`
      - `export`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_platform_adaptation_q3
  question: Android、iOS、Web 或桌面平台各自的插件、原生库和配置文件放在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `export_presets.cfg`
      - `project.godot`
      - `android/`
      - `ios/`
      - `web/`
      - `*.gd`
    keywords:
      - `OS.has_feature`
      - `DisplayServer`
      - `safe_area`
      - `android`
      - `ios`
      - `web`
      - `feature`
      - `export`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_platform_adaptation_q4
  question: 输入适配如何处理触屏、鼠标键盘、手柄和平台返回键差异？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `export_presets.cfg`
      - `project.godot`
      - `android/`
      - `ios/`
      - `web/`
      - `*.gd`
    keywords:
      - `OS.has_feature`
      - `DisplayServer`
      - `safe_area`
      - `android`
      - `ios`
      - `web`
      - `feature`
      - `export`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_platform_adaptation_q5
  question: 分辨率、safe area、横竖屏和窗口模式适配逻辑写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `export_presets.cfg`
      - `project.godot`
      - `android/`
      - `ios/`
      - `web/`
      - `*.gd`
    keywords:
      - `OS.has_feature`
      - `DisplayServer`
      - `safe_area`
      - `android`
      - `ios`
      - `web`
      - `feature`
      - `export`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_platform_adaptation_q6
  question: 存档路径、权限、文件系统和沙盒差异由谁封装？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `export_presets.cfg`
      - `project.godot`
      - `android/`
      - `ios/`
      - `web/`
      - `*.gd`
    keywords:
      - `OS.has_feature`
      - `DisplayServer`
      - `safe_area`
      - `android`
      - `ios`
      - `web`
      - `feature`
      - `export`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_platform_adaptation_q7
  question: 平台特定 SDK、广告、支付、分享或系统服务入口如何接入 Godot 项目？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `export_presets.cfg`
      - `project.godot`
      - `android/`
      - `ios/`
      - `web/`
      - `*.gd`
    keywords:
      - `OS.has_feature`
      - `DisplayServer`
      - `safe_area`
      - `android`
      - `ios`
      - `web`
      - `feature`
      - `export`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_platform_adaptation_q8
  question: 发布构建时，不同平台的导出参数、签名和资源裁剪在哪里配置？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `export_presets.cfg`
      - `project.godot`
      - `android/`
      - `ios/`
      - `web/`
      - `*.gd`
    keywords:
      - `OS.has_feature`
      - `DisplayServer`
      - `safe_area`
      - `android`
      - `ios`
      - `web`
      - `feature`
      - `export`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_platform_adaptation_q9
  question: Web、移动和桌面之间的性能降级、图形选项或资源 fallback 是如何切换的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `export_presets.cfg`
      - `project.godot`
      - `android/`
      - `ios/`
      - `web/`
      - `*.gd`
    keywords:
      - `OS.has_feature`
      - `DisplayServer`
      - `safe_area`
      - `android`
      - `ios`
      - `web`
      - `feature`
      - `export`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
- id: godot_platform_adaptation_q10
  question: 平台相关 bugfix、兼容层或启动流程分支写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `export_presets.cfg`
      - `project.godot`
      - `android/`
      - `ios/`
      - `web/`
      - `*.gd`
    keywords:
      - `OS.has_feature`
      - `DisplayServer`
      - `safe_area`
      - `android`
      - `ios`
      - `web`
      - `feature`
      - `export`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
