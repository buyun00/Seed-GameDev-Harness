---
name: fixed-questions-engine-cocos-plugin-extension
description: cocos / 插件与扩展 固定问题模板
matrix_id: engine.cocos.plugin_extension
axis: engine
engine: cocos
direction_id: plugin_extension
owner: researcher-cocos
question_set_id: qs-cocos-plugin-extension
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.cocos.plugin_extension 的固定问题模板。
- 补充该引擎插件、扩展模块和外部接入方式上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: cocos_plugin_extension_q1
  question: 仓库中是否存在 Cocos Creator 扩展包或插件目录，扩展入口 package.json 和 main/browser 脚本在哪里？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - extensions/
      - packages/
      - package.json
    keywords:
      - contributions
      - main
      - browser
      - extension
      - package.json
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_plugin_extension_q2
  question: 扩展包主要扩展了哪些能力，例如菜单、面板、消息、资源导入、构建流程或编辑器工具？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - extensions/
      - packages/
    keywords:
      - menu
      - panel
      - messages
      - builder
      - asset handler
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_plugin_extension_q3
  question: 运行时第三方插件或 SDK 是通过 npm、子模块、原生库还是手工拷贝方式接入的？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - package.json
      - native/
      - sdk/
      - extensions/
    keywords:
      - dependency
      - plugin
      - sdk
      - submodule
      - third-party
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_plugin_extension_q4
  question: 构建钩子、导出钩子和渠道定制逻辑是否通过官方扩展机制实现，具体 hook 点在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - extensions/
      - build-templates/
      - scripts/
    keywords:
      - hooks
      - build-start
      - build-finish
      - builder
      - export
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_plugin_extension_q5
  question: 插件初始化、卸载和版本升级逻辑是否清晰，仓库里能否看出插件生命周期管理方式？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - extensions/
      - package.json
      - scripts/
    keywords:
      - load
      - unload
      - enable
      - disable
      - version
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_plugin_extension_q6
  question: 编辑器插件与运行时插件的边界是否明确，是否有同名目录同时承担编辑器和游戏逻辑？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - extensions/
      - assets/
      - native/
    keywords:
      - editor
      - runtime
      - extension
      - plugin
      - tool
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_plugin_extension_q7
  question: 插件配置、密钥和渠道参数如何注入，不同环境是否支持分离配置？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - extensions/
      - settings/
      - scripts/
      - native/
    keywords:
      - key
      - secret
      - config
      - env
      - channel
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_plugin_extension_q8
  question: 某个插件缺失或初始化失败时，项目是否提供降级路径、mock 实现或编译时剔除能力？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - extensions/
      - assets/
      - native/
    keywords:
      - fallback
      - mock
      - optional
      - disabled
      - stub
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_plugin_extension_q9
  question: 插件是否接入自动化安装、编译或发布流程，还是依赖文档和人工同步？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - package.json
      - scripts/
      - .github/
      - extensions/
    keywords:
      - install
      - build
      - publish
      - sync
      - pipeline
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_plugin_extension_q10
  question: 扩展包之间是否通过消息系统互相通信，消息名和公开能力是否集中定义？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - extensions/
      - packages/
    keywords:
      - messages
      - broadcast
      - contributions
      - panel
      - ipc
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
