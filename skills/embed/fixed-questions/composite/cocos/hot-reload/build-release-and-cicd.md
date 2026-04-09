---
name: fixed-questions-composite-cocos-hot-reload-build-release-and-cicd
description: cocos / hot-reload x build-release-and-cicd 交叉固定问题模板
composite_id: composite.cocos.hot_reload.build_release_and_cicd
axis: composite
engine: cocos
direction_id: hot_reload
capability: build_release_and_cicd
capability_id: build_release_and_cicd
owner: builder-cocos
researcher_owner: researcher-cocos
capability_owner: researcher-infra
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.cocos.hot_reload.build_release_and_cicd` 的交叉固定问题模板。
- 只补充 `engine.cocos.hot_reload` 与 `capability.build_release_and_cicd` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/cocos/hot-reload.md` 和 `fixed-questions/capability/build-release-and-cicd.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 当前先留空模板，后续按实际项目与复用频次补充问题。

## 固定问题

- id: cocos_hot_reload_build_release_and_cicd_q1
  question: `project.manifest`、`version.manifest` 和热更资源索引是在流水线的哪个阶段生成的，是紧跟 Cocos 构建产物后生成，还是独立脚本二次扫描产物目录？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - build/
      - manifest/
      - remote-assets/
      - scripts/
      - tools/
      - ci/
    keywords:
      - project.manifest
      - version.manifest
      - generate
      - hotupdate
      - manifest
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_build_release_and_cicd_q2
  question: CI 在生成热更包时，究竟以哪些目录作为输入，例如 `build`、`remote-assets`、bundle 子目录或脚本目录，热更边界写在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - build/
      - remote-assets/
      - assets/
      - scripts/
      - ci/
      - .github/
    keywords:
      - input
      - remote-assets
      - bundle
      - build
      - hotupdate
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_build_release_and_cicd_q3
  question: 不同环境、渠道或平台的 `packageUrl`、`remoteManifestUrl`、`remoteVersionUrl` 是如何注入到 manifest 中的，注入逻辑由谁维护？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - manifest/
      - scripts/
      - profiles/
      - ci/
      - assets/
    keywords:
      - packageUrl
      - remoteManifestUrl
      - remoteVersionUrl
      - env
      - channel
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_build_release_and_cicd_q4
  question: 构建发布系统如何保证 Cocos 资源 hash、MD5 Cache 和热更 manifest 中记录的 md5/size 一致，是否存在二次改写后失配风险？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - build/
      - manifest/
      - remote-assets/
      - scripts/
      - profiles/
    keywords:
      - md5
      - size
      - md5Cache
      - hash
      - verify
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_build_release_and_cicd_q5
  question: 热更流水线是否同时处理首包资源和热更资源；如果两套产物都生成，目录隔离、版本命名和上传顺序如何约束？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - build/
      - remote-assets/
      - manifest/
      - ci/
      - scripts/
    keywords:
      - hotupdate
      - package
      - version
      - upload
      - remote-assets
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_build_release_and_cicd_q6
  question: Android、iOS、桌面原生包与热更资源的版本对应关系如何维护，是否能从同一次构建里追溯出安装包版本与热更资源版本的映射？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - build/
      - manifest/
      - ci/
      - scripts/
      - native/
      - releases/
    keywords:
      - android
      - ios
      - version
      - mapping
      - release
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_build_release_and_cicd_q7
  question: 上传热更包到 CDN 或文件服务器时，是否有原子发布、灰度目录、回滚目录或旧版本保留策略，相关脚本位于哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - ci/
      - .github/
      - scripts/
      - deploy/
      - remote-assets/
    keywords:
      - upload
      - rollback
      - gray
      - release
      - cdn
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_build_release_and_cicd_q8
  question: 构建脚本是否会在热更包生成前后额外处理搜索路径、原生模板、启动脚本或补丁清单，以确保客户端下载后能正确切换到新资源？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - scripts/
      - native/
      - build-templates/
      - manifest/
      - build/
    keywords:
      - searchPaths
      - template
      - startup
      - manifest
      - patch
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_build_release_and_cicd_q9
  question: 若构建失败或校验失败，流水线是否会阻断热更发布；失败日志是否能直接定位到 manifest 生成、资源拷贝、压缩或上传环节？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - ci/
      - .github/
      - scripts/
      - logs/
      - build/
    keywords:
      - fail
      - error
      - verify
      - copy
      - upload
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_build_release_and_cicd_q10
  question: 是否存在仅原生平台启用热更、Web/小游戏跳过热更包生成的流水线分支；平台判定和跳过逻辑写在何处？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - ci/
      - .github/
      - scripts/
      - profiles/
      - assets/
    keywords:
      - NATIVE
      - web
      - minigame
      - platform
      - skip
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
