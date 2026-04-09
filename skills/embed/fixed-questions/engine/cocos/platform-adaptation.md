---
name: fixed-questions-engine-cocos-platform-adaptation
description: cocos / 平台适配 固定问题模板
matrix_id: engine.cocos.platform_adaptation
axis: engine
engine: cocos
direction_id: platform_adaptation
owner: researcher-cocos
question_set_id: qs-cocos-platform-adaptation
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.cocos.platform_adaptation 的固定问题模板。
- 补充该引擎跨平台构建、条件分支与终端能力适配上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: cocos_platform_adaptation_q1
  question: 项目实际支持哪些平台，平台切换点和条件编译宏主要集中在哪些脚本或构建配置中？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - assets/
      - native/
      - settings/
      - build-templates/
    keywords:
      - sys.platform
      - Platform
      - NATIVE
      - WECHAT
      - macro
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_platform_adaptation_q2
  question: Android、iOS、Web、小游戏和桌面端的差异逻辑是集中封装还是分散在业务代码中？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - native/
      - build-templates/
    keywords:
      - android
      - ios
      - web
      - wechat
      - platformService
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_platform_adaptation_q3
  question: 登录、支付、分享、广告、推送等平台能力是否有统一适配层，适配入口在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - native/
      - sdk/
    keywords:
      - login
      - pay
      - share
      - ad
      - platform adapter
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_platform_adaptation_q4
  question: 分辨率、刘海屏、安全区、横竖屏和输入方式差异是如何做 UI 和交互适配的？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/ui/
      - assets/scripts/
      - native/
    keywords:
      - SafeArea
      - orientation
      - keyboard
      - notch
      - resize
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_platform_adaptation_q5
  question: 文件系统、下载、网络权限和本地缓存等能力在不同平台的差异由谁兜底处理？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - native/
      - sdk/
    keywords:
      - download
      - writablePath
      - permission
      - cache
      - file
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_platform_adaptation_q6
  question: 构建模板、渠道包配置、包名签名和平台参数注入是通过编辑器配置还是仓库脚本自动完成的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - build-templates/
      - scripts/
      - settings/
      - native/
    keywords:
      - package name
      - keystore
      - signing
      - channel
      - template
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_platform_adaptation_q7
  question: 资源路径、远端地址和热更新策略是否随平台或渠道变化，变化点配置在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - settings/
      - assets/
      - scripts/
      - native/
    keywords:
      - cdn
      - remote
      - hotupdate
      - channel
      - env
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_platform_adaptation_q8
  question: 是否针对不同平台做了性能参数裁剪，例如帧率、渲染质量、物理开关或特效降级？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - settings/
      - native/
    keywords:
      - frameRate
      - quality
      - low device
      - effect
      - optimize
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_platform_adaptation_q9
  question: 崩溃、日志、埋点和运营监控是否按平台分别接入，还是统一由跨平台中间层处理？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - native/
      - sdk/
    keywords:
      - crash
      - log
      - analytics
      - report
      - monitor
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_platform_adaptation_q10
  question: 平台专属代码是否被清晰隔离并可回溯，例如小游戏平台宏、原生桥接和 Web fallback 各自放在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - native/
      - extensions/
    keywords:
      - WECHAT
      - BYTEDANCE
      - NATIVE
      - WEB
      - fallback
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
