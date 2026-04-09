---
name: fixed-questions-composite-cocos-asset-pipeline-data-config-pipeline
description: cocos / asset-pipeline x data-config-pipeline 交叉固定问题模板
composite_id: composite.cocos.asset_pipeline.data_config_pipeline
axis: composite
engine: cocos
direction_id: asset_pipeline
capability: data_config_pipeline
capability_id: data_config_pipeline
owner: builder-cocos
researcher_owner: researcher-cocos
capability_owner: researcher-config
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.cocos.asset_pipeline.data_config_pipeline` 的交叉固定问题模板。
- 只补充 `engine.cocos.asset_pipeline` 与 `capability.data_config_pipeline` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/cocos/asset-pipeline.md` 和 `fixed-questions/capability/data-config-pipeline.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 当前先留空模板，后续按实际项目与复用频次补充问题。

## 交叉固定问题

- id: cocos_asset_pipeline_data_config_pipeline_q1
  question: 配置表源文件是如何进入 Cocos 资源树的，是先导出到 `assets/resources`/bundle，再由引擎导入，还是运行时从原生可写目录或远端拉取？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - assets/config/
      - assets/resources/
      - assets/bundles/
      - remote-assets/
      - tools/
      - scripts/
    keywords:
      - config
      - resources.load
      - loadBundle
      - writablePath
      - remote
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_data_config_pipeline_q2
  question: Excel、CSV、TSV、Google Sheet 或 schema 文件转成 JSON、二进制、`JsonAsset`/`TextAsset` 的导表步骤位于哪里，是外部工具、编辑器扩展还是 build hook？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - tools/
      - scripts/
      - extensions/
      - assets/config/
      - assets/resources/
    keywords:
      - xlsx
      - csv
      - schema
      - JsonAsset
      - TextAsset
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_data_config_pipeline_q3
  question: 配置生成物是否按玩法模块或 bundle 分仓，加载边界是否和 Asset Bundle、场景包或远端资源包保持一致？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/bundles/
      - assets/resources/
      - assets/config/
      - remote-assets/
      - profiles/
    keywords:
      - bundle
      - config
      - resources
      - remote-assets
      - module
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_data_config_pipeline_q4
  question: 运行时读取配置时，项目是走 `resources.load`、`assetManager.loadBundle`、原生文件读取，还是自定义配置管理器统一封装？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
      - assets/src/
      - assets/config/
    keywords:
      - resources.load
      - assetManager
      - loadBundle
      - ConfigManager
      - JsonAsset
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_data_config_pipeline_q5
  question: 配置生成后是否依赖 `.meta`、uuid、asset-db 或固定目录结构；如果导表覆盖文件，会不会影响资源引用稳定性？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/config/
      - assets/resources/
      - settings/
      - extensions/
    keywords:
      - .meta
      - uuid
      - asset-db
      - reimport
      - importer
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_data_config_pipeline_q6
  question: 是否会同时生成 TypeScript 枚举、类型定义、协议映射或索引代码，供脚本层在读取配置时获得强类型或快速索引？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - tools/
      - scripts/
      - assets/scripts/
      - assets/src/
      - assets/generated/
    keywords:
      - codegen
      - enum
      - d.ts
      - generated
      - index
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_data_config_pipeline_q7
  question: 多环境、多渠道、多语言或灰度配置是如何叠加的，覆盖顺序写在目录结构、导表脚本还是运行时 merge 逻辑中？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/config/
      - profiles/
      - scripts/
      - tools/
      - assets/i18n/
    keywords:
      - env
      - channel
      - locale
      - merge
      - override
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_data_config_pipeline_q8
  question: 大型配置表是否做了压缩、拆包、二进制化、加密或按需加载；对应的 importer、解码器或加载封装位于哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/config/
      - assets/resources/
      - tools/
      - scripts/
      - extensions/
    keywords:
      - binary
      - compress
      - encrypt
      - decoder
      - split
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_data_config_pipeline_q9
  question: 配置变更是否会进入热更新或远端资源发布链路；若会，配置版本号、bundle 版本和代码版本之间如何对齐？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - remote-assets/
      - manifest/
      - assets/config/
      - scripts/
      - ci/
    keywords:
      - hotupdate
      - manifest
      - config version
      - bundle
      - remote
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_asset_pipeline_data_config_pipeline_q10
  question: 构建前是否有配置校验、Schema 校验、引用检查、重复键检查或跨表检查，失败时是阻塞 Cocos 构建还是只打印告警？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - tools/
      - scripts/
      - extensions/
      - .github/
      - ci/
    keywords:
      - validate
      - schema
      - duplicate key
      - lint
      - fail
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

## 交叉搜索提示

- 优先从每条问题自己的 `search_hints.paths` 开始找。
- 额外关注目录：`assets/config/`、`assets/resources/`、`assets/bundles/`、`tools/`、`scripts/`、`extensions/`、`profiles/`、`remote-assets/`
- 额外关注关键词：`JsonAsset`、`TextAsset`、`config`、`xlsx`、`csv`、`codegen`、`asset-db`、`schema`
