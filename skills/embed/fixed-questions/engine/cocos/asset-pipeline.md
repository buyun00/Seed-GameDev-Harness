---
name: fixed-questions-engine-cocos-asset-pipeline
description: cocos / 资源管线 固定问题模板
matrix_id: engine.cocos.asset_pipeline
axis: engine
engine: cocos
direction_id: asset_pipeline
owner: researcher-cocos
question_set_id: qs-cocos-asset-pipeline
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.cocos.asset_pipeline 的固定问题模板。
- 补充该引擎资源组织、加载、释放和打包主路径上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: cocos_asset_pipeline_q1
  question: 项目资源是如何分配到 resources、bundle、本地包和远端包中的，主资源组织策略是什么？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - assets/
      - assets/resources/
      - assets/bundles/
      - remote-assets/
    keywords:
      - resources.load
      - loadBundle
      - bundle
      - remote
      - assetManager
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_q2
  question: 资源加载入口是否经过统一封装，还是业务代码直接散落调用 assetManager、resources.load 和 bundle.load？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
      - assets/src/
    keywords:
      - assetManager
      - resources.load
      - bundle.load
      - loadAny
      - AssetLoader
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_q3
  question: 资源释放、引用计数和缓存回收由谁负责，项目是否显式调用 release、decRef 或自定义缓存管理器？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
    keywords:
      - release
      - decRef
      - addRef
      - cache
      - AssetManager
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_q4
  question: 场景、Prefab、图集、音频和 Spine 等不同资源类型是否有各自的加载封装和生命周期策略？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/prefabs/
      - assets/audio/
      - assets/spine/
    keywords:
      - Prefab
      - AudioClip
      - SpriteAtlas
      - sp.Skeleton
      - AnimationClip
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_q5
  question: 是否存在预加载策略，例如首屏预载、场景预载、分包预热或弱网兜底资源加载？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
      - assets/scenes/
    keywords:
      - preload
      - preloadScene
      - prefetch
      - warmup
      - loading
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_q6
  question: 资源命名、目录约定和地址解析是否统一，业务是否依赖硬编码路径字符串？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - tools/
      - scripts/
    keywords:
      - path
      - assetPath
      - enum
      - atlas
      - bundleName
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_q7
  question: 构建时是否有自动图集、压缩、裁剪、重命名或清单生成步骤，这些逻辑写在编辑器还是外部脚本中？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - tools/
      - scripts/
      - extensions/
      - build-templates/
    keywords:
      - atlas
      - compress
      - manifest
      - pipeline
      - build
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_q8
  question: 资源加载失败、CDN 不可达或版本不一致时是否有重试、降级或本地兜底策略？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - remote-assets/
      - native/
    keywords:
      - retry
      - fallback
      - downloadFailed
      - timeout
      - cacheManager
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_q9
  question: 编辑器导入资源后的 meta、uuid 和自动生成配置是否会被业务层显式依赖，依赖点在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - settings/
    keywords:
      - uuid
      - meta
      - importer
      - db://
      - asset-db
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_q10
  question: 是否存在统一的资源审计或内存巡检工具，用于发现 bundle 过大、资源泄漏或重复依赖问题？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - tools/
      - scripts/
      - extensions/
    keywords:
      - audit
      - memory
      - leak
      - dependency
      - analyze
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
