---
name: fixed-questions-engine-unity-plugin-extension
description: unity / 插件与扩展 固定问题模板
matrix_id: engine.unity.plugin_extension
axis: engine
engine: unity
direction_id: plugin_extension
owner: researcher-unity
question_set_id: qs-unity-plugin-extension
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unity.plugin_extension 的固定问题模板。
- 补充该引擎插件、扩展模块和外部接入方式上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 taxonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: unity_plugin_extension_q1
  question: 项目当前引入了哪些 Unity Package、本地插件和第三方扩展，它们的主入口分别在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Packages/manifest.json
      - Packages/
      - Assets/Plugins/
      - Assets/
    keywords:
      - dependencies
      - package
      - plugin
      - third party
      - manifest.json
      - scopedRegistries
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_plugin_extension_q2
  question: 项目是否使用了 embedded package、本地 package 或 git package，自定义包目录和引用关系在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Packages/manifest.json
      - Packages/packages-lock.json
      - Packages/
    keywords:
      - file:
      - git
      - embedded
      - local package
      - package.json
      - dependencies
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_plugin_extension_q3
  question: Editor 扩展模块在哪里，例如自定义窗口、菜单、Inspector、PropertyDrawer 或 Build 工具？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Packages/
    keywords:
      - EditorWindow
      - MenuItem
      - CustomEditor
      - PropertyDrawer
      - SettingsProvider
      - BuildPipeline
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_plugin_extension_q4
  question: 是否存在自定义导入器、AssetPostprocessor、构建扩展或 Package extension point，这些注册点在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Packages/
    keywords:
      - ScriptedImporter
      - AssetPostprocessor
      - IPreprocessBuildWithReport
      - IPostprocessBuildWithReport
      - package extension
      - importer
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_plugin_extension_q5
  question: 第三方 SDK 或功能插件是否都包了一层项目自己的 wrapper / facade，包装代码在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Plugins/
      - Assets/
      - Packages/
    keywords:
      - Wrapper
      - Facade
      - Adapter
      - SDK
      - Service
      - bridge
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_plugin_extension_q6
  question: 插件的初始化、注册、反注册或运行时启停入口在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Assets/Plugins/
      - Packages/
    keywords:
      - Initialize
      - Register
      - Unregister
      - Setup
      - Dispose
      - startup
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_plugin_extension_q7
  question: 插件的导入平台过滤、CPU 架构限制和 Editor / Runtime 兼容设置在哪里配置？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Plugins/
      - Assets/Editor/
      - Packages/
    keywords:
      - PluginImporter
      - SetCompatibleWithPlatform
      - CPU
      - Editor
      - Any Platform
      - plugin
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_plugin_extension_q8
  question: 插件是否参与构建导出、资源打包或平台后处理，具体挂钩点在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Packages/
      - Assets/Plugins/
    keywords:
      - BuildPipeline
      - PostProcessBuild
      - preprocess
      - export
      - package
      - build report
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_plugin_extension_q9
  question: 插件自身的配置资产、Settings 面板、ScriptableObject 配置或 manifest 放在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - ProjectSettings/
    keywords:
      - SettingsProvider
      - ScriptableObject
      - Settings
      - config
      - manifest
      - package.json
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_plugin_extension_q10
  question: 插件升级、替换或移除时的边界在哪里，是否通过独立程序集、Facade 或目录隔离降低耦合？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Packages/
      - Assets/Plugins/
      - Assets/
    keywords:
      - asmdef
      - facade
      - wrapper
      - package
      - migration
      - dependency
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

