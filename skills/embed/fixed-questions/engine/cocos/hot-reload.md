---
name: fixed-questions-engine-cocos-hot-reload
description: cocos / 热更新 固定问题模板
matrix_id: engine.cocos.hot_reload
axis: engine
engine: cocos
direction_id: hot_reload
owner: researcher-cocos
question_set_id: qs-cocos-hot-reload
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.cocos.hot_reload 的固定问题模板。
- 补充该引擎热更新入口、版本清单和补丁应用链路上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: cocos_hot_reload_q1
  question: 热更新入口在哪里初始化，是启动场景、更新管理器还是平台桥接层负责触发？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - assets/
      - assets/scripts/
      - native/
    keywords:
      - hotupdate
      - AssetsManager
      - updateManager
      - checkUpdate
      - startUpdate
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_q2
  question: manifest、version 文件和资源索引是如何生成的，生成脚本或构建步骤位于哪里？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - build/
      - tools/
      - scripts/
      - manifest/
    keywords:
      - manifest
      - version
      - project.manifest
      - version.manifest
      - generate
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_q3
  question: 实际参与热更新的内容是 bundle、资源包、脚本文件还是原生补丁，边界如何定义？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - build/
      - remote-assets/
    keywords:
      - bundle
      - assets
      - script
      - native
      - packageUrl
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_q4
  question: 更新包下载地址、CDN 路由和渠道版本配置写在何处，是否支持不同环境切换？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - settings/
      - scripts/
      - native/
    keywords:
      - packageUrl
      - cdn
      - channel
      - env
      - remote server
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_q5
  question: 更新前的版本检查、下载校验和失败重试逻辑在哪里，是否校验 md5 或文件大小？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - native/
      - scripts/
    keywords:
      - verifyCallback
      - md5
      - retry
      - checkUpdate
      - downloadFailedAssets
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_q6
  question: 补丁应用成功后如何切换到新版本内容，是重启游戏、重载 bundle 还是重新进场景？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - native/
    keywords:
      - restart
      - loadScene
      - bundle
      - searchPaths
      - hotUpdateFinished
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_q7
  question: 更新过程中的 UI 表现是否统一，包括检查进度、下载进度、错误提示和强更拦截？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/ui/
      - assets/scripts/
      - assets/prefabs/
    keywords:
      - progress
      - update ui
      - force update
      - retry
      - tip
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_q8
  question: 灰度发布、版本回滚和兼容旧包逻辑是否存在，相关判定点在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - tools/
      - scripts/
      - assets/
    keywords:
      - rollback
      - gray
      - compatibility
      - minVersion
      - force update
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_q9
  question: 热更新是否只在原生平台启用，Web、小游戏或编辑器环境下是否显式禁用或走替代逻辑？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - native/
      - settings/
    keywords:
      - NATIVE
      - WECHAT
      - PREVIEW
      - support hotupdate
      - platform
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_q10
  question: 热更新打包链路是否接入 CI、发布脚本或运维工具，还是完全依赖本地手工执行？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - scripts/
      - tools/
      - .github/
      - build/
    keywords:
      - ci
      - publish
      - upload
      - hotupdate pipeline
      - deploy
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
