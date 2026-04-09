---
name: fixed-questions-composite-cocos-asset-pipeline-build-release-and-cicd
description: cocos / asset-pipeline x build-release-and-cicd 交叉固定问题模板
composite_id: composite.cocos.asset_pipeline.build_release_and_cicd
axis: composite
engine: cocos
direction_id: asset_pipeline
capability: build_release_and_cicd
capability_id: build_release_and_cicd
owner: builder-cocos
researcher_owner: researcher-cocos
capability_owner: researcher-infra
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.cocos.asset_pipeline.build_release_and_cicd` 的交叉固定问题模板。
- 只补充 `engine.cocos.asset_pipeline` 与 `capability.build_release_and_cicd` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/cocos/asset-pipeline.md` 和 `fixed-questions/capability/build-release-and-cicd.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 当前先留空模板，后续按实际项目与复用频次补充问题。

## 交叉固定问题

- id: cocos_asset_pipeline_build_release_and_cicd_q1
  question: 构建脚本是在哪里把 `resources`、Asset Bundle、远端资源和原生包内资源拆成不同发布产物的，分仓规则写在编辑器配置、构建 profile 还是自定义 build hook 中？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - assets/
      - assets/resources/
      - assets/bundles/
      - remote-assets/
      - profiles/
      - extensions/
    keywords:
      - resources
      - bundle
      - remote-assets
      - build profile
      - builder
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_build_release_and_cicd_q2
  question: CI 在执行 Cocos 构建时，是否会按平台或渠道覆写 bundle 压缩、MD5 Cache、纹理压缩、资源分包或远端资源地址，覆写入口在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - .github/
      - ci/
      - scripts/
      - profiles/
      - build-templates/
      - native/
    keywords:
      - md5Cache
      - channel
      - env
      - texture compression
      - bundle
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_build_release_and_cicd_q3
  question: 自动图集、纹理压缩、音频转码、字体裁剪等资源预处理，是在 Cocos Editor 构建阶段完成，还是由外部脚本先处理后再导入？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - tools/
      - scripts/
      - extensions/
      - build-templates/
    keywords:
      - atlas
      - compress
      - importer
      - audio
      - font
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_build_release_and_cicd_q4
  question: 构建完成后上传到 CDN 或对象存储的究竟是整个 `build` 目录、指定 bundle 子目录，还是单独的 `remote-assets`/manifest，上传白名单在哪里定义？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - build/
      - remote-assets/
      - manifest/
      - scripts/
      - ci/
      - .github/
    keywords:
      - upload
      - publish
      - cdn
      - remote-assets
      - manifest
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_build_release_and_cicd_q5
  question: 是否存在对 `settings.json`、bundle `config.json`、资源 manifest 或版本描述文件的二次改写步骤，用来注入版本号、渠道号、包体标识或资源根地址？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - build/
      - scripts/
      - extensions/
      - profiles/
      - manifest/
      - remote-assets/
    keywords:
      - settings.json
      - config.json
      - version
      - channel
      - packageUrl
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_build_release_and_cicd_q6
  question: 原生平台打包时，哪些资源会被打进安装包，哪些资源会被留作首包外下载资源，判定逻辑落在 Cocos 构建配置、原生工程脚本还是发布流水线？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - build/
      - native/
      - build-templates/
      - proj.android-studio/
      - proj.ios_mac/
      - scripts/
    keywords:
      - package
      - native
      - assets
      - app/src
      - proj
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_build_release_and_cicd_q7
  question: 资源构建失败时，流水线如何定位到具体 bundle、具体 importer 或具体扩展脚本，日志中是否保留了 Cocos build hooks 和资源处理阶段的输出？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - .github/
      - ci/
      - scripts/
      - extensions/
      - build/
      - logs/
    keywords:
      - error
      - failed
      - build hook
      - importer
      - asset-handler
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_build_release_and_cicd_q8
  question: Cocos 构建产物和 Android Studio/Xcode 二次编译产物之间，发布系统最终以哪个目录为准，是否存在 `build/.../proj` 与最终安装包资源不一致的问题？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - build/
      - build/android/proj/
      - build/ios/proj/
      - proj.android-studio/
      - proj.ios_mac/
      - native/
    keywords:
      - assembleRelease
      - outputs/apk
      - xcode
      - publish
      - proj
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_build_release_and_cicd_q9
  question: 是否存在独立于客户端代码版本的资源版本号或资源 hash 发布机制；如果有，版本清单由谁生成、谁归档、谁负责回滚？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - manifest/
      - remote-assets/
      - scripts/
      - ci/
      - deploy/
      - releases/
    keywords:
      - version
      - md5
      - hash
      - rollback
      - release
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_build_release_and_cicd_q10
  question: 若项目同时使用首包资源和热更资源，CI 是否会同时生成冷包资源与热更资源，两套目录如何避免重复打包、相互覆盖或版本串线？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - build/
      - remote-assets/
      - manifest/
      - scripts/
      - ci/
      - assets/
    keywords:
      - hotupdate
      - remote-assets
      - package
      - duplicate
      - manifest
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

## 交叉搜索提示

- 优先从每条问题自己的 `search_hints.paths` 开始找。
- 额外关注目录：`assets/resources/`、`assets/bundles/`、`remote-assets/`、`build/`、`profiles/`、`extensions/`、`build-templates/`、`native/`
- 额外关注关键词：`builder`、`build profile`、`settings.json`、`config.json`、`manifest`、`md5Cache`、`upload`、`publish`
