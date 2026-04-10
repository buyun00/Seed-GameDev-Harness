---
name: fixed-questions-composite-cocos-hot-reload-lua-embedding
description: cocos / hot-reload x lua-embedding 交叉固定问题模板
composite_id: composite.cocos.hot_reload.lua_embedding
axis: composite
engine: cocos
direction_id: hot_reload
capability: lua_embedding
capability_id: lua_embedding
owner: builder-engine
researcher_owner: researcher-cocos
capability_owner: researcher-lua
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.cocos.hot_reload.lua_embedding` 的交叉固定问题模板。
- 只补充 `engine.cocos.hot_reload` 与 `capability.lua_embedding` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/cocos/hot-reload.md` 和 `fixed-questions/capability/lua-embedding.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 当前先留空模板，后续按实际项目与复用频次补充问题。

## 固定问题

- id: cocos_hot_reload_lua_embedding_q1
  question: 热更新实际更新的内容是否包含 Lua 源码、Lua 字节码、配置资源和普通资源；边界定义写在 manifest 生成脚本还是 Lua 启动脚本中？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - manifest/
      - remote-assets/
      - scripts/
      - src/
      - lua/
      - script/
    keywords:
      - lua
      - hotupdate
      - manifest
      - bytecode
      - asset
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_lua_embedding_q2
  question: 热更补丁下载完成后，Lua 搜索路径或 `package.path` 是在哪里追加到可写目录或新资源目录的，优先级如何高于包内旧脚本？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - frameworks/runtime-src/Classes/
      - src/
      - lua/
      - script/
      - res/
    keywords:
      - package.path
      - addSearchPath
      - writablePath
      - search path
      - hotupdate
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_lua_embedding_q3
  question: Lua 模块在应用补丁后是通过清理 `package.loaded`、重启 Lua VM、重启游戏还是局部 `require` 重载来切换到新版本逻辑的？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - lua/
      - script/
      - src/
      - frameworks/runtime-src/Classes/
      - scripts/
    keywords:
      - package.loaded
      - require
      - reload
      - restart
      - LuaStack
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_lua_embedding_q4
  question: Lua 脚本是否会在打包或热更前被编译成字节码、做 xxtea/自定义加密；构建阶段与运行时解密入口分别在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - tools/
      - scripts/
      - src/
      - lua/
      - frameworks/runtime-src/Classes/
    keywords:
      - xxtea
      - luacompile
      - bytecode
      - decrypt
      - encrypt
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_lua_embedding_q5
  question: 若 C++/原生桥接层暴露给 Lua 的接口在版本间发生变化，热更系统如何保证新 Lua 脚本与旧原生包的兼容性，兼容检查点在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - frameworks/runtime-src/Classes/
      - plugins/
      - manifest/
      - scripts/
      - lua/
    keywords:
      - compatibility
      - version
      - bridge
      - api
      - check
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_lua_embedding_q6
  question: 热更前后 Lua 全局单例、定时器、事件监听和原生回调 handler 如何迁移或清理，是否存在旧函数引用残留导致回调失效的问题？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - lua/
      - script/
      - src/
      - frameworks/runtime-src/Classes/
      - assets/
    keywords:
      - singleton
      - timer
      - event
      - handler
      - cleanup
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_lua_embedding_q7
  question: 启动时是否存在一个专门负责“先检查热更、再启动 Lua 主逻辑”的入口脚本或原生入口，主流程顺序在哪里定义？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - src/
      - lua/
      - script/
      - frameworks/runtime-src/Classes/
      - manifest/
    keywords:
      - startup
      - checkUpdate
      - hotupdate
      - main.lua
      - entry
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_lua_embedding_q8
  question: 当 Lua 补丁加载成功但资源补丁未完成、或资源版本与 Lua 版本不匹配时，系统是回滚、阻断启动还是允许降级运行？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - manifest/
      - scripts/
      - lua/
      - src/
      - remote-assets/
    keywords:
      - rollback
      - fallback
      - version mismatch
      - hotupdate
      - downgrade
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_lua_embedding_q9
  question: 原生可写目录、安装包目录和远端补丁目录的读取优先级如何定义，Lua 脚本加载时究竟先查哪一层路径？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - frameworks/runtime-src/Classes/
      - src/
      - res/
      - lua/
      - remote-assets/
    keywords:
      - writablePath
      - addSearchPath
      - search path
      - package.path
      - hotupdate
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_hot_reload_lua_embedding_q10
  question: CI 或发布脚本是否会单独生成 Lua 热更包、Lua 版本号或 Lua 校验清单，以区别于普通资源补丁和代码包？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - scripts/
      - ci/
      - .github/
      - manifest/
      - remote-assets/
    keywords:
      - lua package
      - version
      - checksum
      - manifest
      - publish
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
