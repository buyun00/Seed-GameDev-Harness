---
name: fixed-questions-capability-build-release-and-cicd
description: 构建发布与 CI/CD 固定问题模板
matrix_id: capability.build_release_and_cicd
axis: capability
capability: build_release_and_cicd
capability_id: build_release_and_cicd
owner: researcher-infra
question_set_id: qs-common-build-release-and-cicd
scope:
  - agent-inject
---

## 填写说明

- 本文件是 capability.build_release_and_cicd 的固定问题模板。
- 补充构建、打包、发布、热更产物生成和流水线上的固定问题。
- 后续填写时，只写该 capability 自己必须回答的问题，不要把引擎主线问题写进来。

## 固定问题

- id: capability_build_release_and_cicd_q1
  question: 项目的构建入口是什么，是引擎 Editor 脚本、命令行脚本、CI workflow 还是外部打包工具？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `Editor/`
      - `Tools/`
      - `Build/`
      - `Scripts/`
      - `.github/workflows/`
      - `.gitlab-ci.yml`
      - `Jenkinsfile`
      - `package.json`
      - `Makefile`
    keywords:
      - `Build`
      - `build`
      - `compile`
      - `export`
      - `ProjectBuild`
      - `BuildPipeline`
      - `batchmode`
      - `CI`
      - `workflow`
      - `Jenkins`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_build_release_and_cicd_q2
  question: 目标平台、渠道、环境、包名、版本号和构建配置在哪里设置或注入？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `ProjectSettings/`
      - `Editor/`
      - `Build/`
      - `Tools/`
      - `Scripts/`
      - `Assets/`
      - `.github/workflows/`
    keywords:
      - `version`
      - `bundle`
      - `package`
      - `channel`
      - `env`
      - `target`
      - `platform`
      - `Android`
      - `iOS`
      - `PlayerSettings`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_build_release_and_cicd_q3
  question: CI/CD 流水线在哪里定义，是否包含拉代码、依赖安装、构建、测试、打包和上传步骤？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `.github/workflows/`
      - `.gitlab-ci.yml`
      - `Jenkinsfile`
      - `Build/`
      - `ci/`
      - `scripts/`
      - `Tools/`
    keywords:
      - `checkout`
      - `install`
      - `test`
      - `build`
      - `package`
      - `upload`
      - `artifact`
      - `release`
      - `deploy`
      - `workflow`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_build_release_and_cicd_q4
  question: Android、iOS、PC、Web 或主机平台的导出链路是否有后处理、签名、证书或平台工程注入步骤？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `Editor/`
      - `Build/`
      - `Assets/Plugins/`
      - `ProjectSettings/`
      - `gradle/`
      - `ios/`
      - `xcode/`
    keywords:
      - `PostProcessBuild`
      - `PBXProject`
      - `plist`
      - `gradle`
      - `AndroidManifest`
      - `keystore`
      - `sign`
      - `certificate`
      - `provision`
      - `export`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_build_release_and_cicd_q5
  question: 资源包、AssetBundle、Addressables、热更包或补丁产物的生成入口和输出目录在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `Assets/`
      - `Editor/`
      - `Build/`
      - `StreamingAssets/`
      - `AddressableAssetsData/`
      - `HotUpdate/`
      - `Patch/`
    keywords:
      - `AssetBundle`
      - `Addressables`
      - `StreamingAssets`
      - `HotUpdate`
      - `Patch`
      - `Bundle`
      - `Manifest`
      - `BuildAssetBundles`
      - `BuildPlayerContent`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_build_release_and_cicd_q6
  question: 版本号、资源版本、manifest、hash 或 changelog 如何生成并进入发布包？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `Build/`
      - `Editor/`
      - `Tools/`
      - `Assets/`
      - `StreamingAssets/`
      - `Release/`
    keywords:
      - `version`
      - `manifest`
      - `hash`
      - `md5`
      - `sha`
      - `changelog`
      - `resVersion`
      - `appVersion`
      - `bundleVersion`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_build_release_and_cicd_q7
  question: 构建产物、日志、符号文件、上传包和发布目录的命名与归档规则是什么？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `Build/`
      - `Release/`
      - `Artifacts/`
      - `Logs/`
      - `.github/workflows/`
      - `.gitlab-ci.yml`
      - `Jenkinsfile`
    keywords:
      - `artifact`
      - `output`
      - `release`
      - `symbols`
      - `dSYM`
      - `mapping`
      - `log`
      - `archive`
      - `upload`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_build_release_and_cicd_q8
  question: 构建前后的校验、测试、静态检查、资源检查或配置检查步骤在哪里执行？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `Tests/`
      - `Editor/`
      - `Tools/`
      - `Scripts/`
      - `.github/workflows/`
      - `.gitlab-ci.yml`
      - `Jenkinsfile`
    keywords:
      - `test`
      - `lint`
      - `validate`
      - `check`
      - `verify`
      - `analyze`
      - `prebuild`
      - `postbuild`
      - `quality`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_build_release_and_cicd_q9
  question: 发布上传、分发、渠道服、CDN 或应用商店提交是否有自动化入口？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `Build/`
      - `Release/`
      - `Tools/`
      - `Scripts/`
      - `.github/workflows/`
      - `.gitlab-ci.yml`
      - `Jenkinsfile`
    keywords:
      - `upload`
      - `deploy`
      - `publish`
      - `release`
      - `cdn`
      - `store`
      - `appcenter`
      - `steam`
      - `channel`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_build_release_and_cicd_q10
  question: 构建发布说明、人工操作步骤、回滚流程或密钥管理约定放在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `README.md`
      - `docs/`
      - `doc/`
      - `Build/`
      - `Release/`
      - `Tools/`
      - `文档/`
    keywords:
      - `build`
      - `release`
      - `deploy`
      - `rollback`
      - `secret`
      - `keystore`
      - `certificate`
      - `发布`
      - `打包`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
