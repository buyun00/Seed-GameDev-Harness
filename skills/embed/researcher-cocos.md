---
name: embed-researcher-cocos
description: /seed:embed Cocos Creator researcher 扫描剧本
triggers:
  - embed cocos researcher
  - cocos scan
  - typescript gameplay scan
domain:
  - project-analysis
scope:
  - agent-inject
---

## 加载顺序

创建 `researcher-cocos` 前，必须先加载：

1. `seed/skills/embed/researcher-common.md`
2. `seed/skills/embed/researcher-runtime-common.md`
3. `seed/skills/embed/researcher-cocos.md`

## TaskCreate 模板

```text
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: Cocos Creator 调查报告（SendMessage 给 leader 与 builder-cocos）
Done Definition: 报告先输出通用规则执行结果，再输出运行时必查项结果，最后输出 Cocos 领域发现；每条结论附证据路径；若运行时必查项缺失，则按 researcher-runtime-common 输出必查项缺失错误
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目 Cocos Creator 技术栈，为生成 skill 文件提供依据
Scope Coverage: Cocos 项目结构、组件脚本命名和挂载约定、TypeScript/JavaScript 编码规范、热更方案、小游戏平台适配
Exclusions: 非 Cocos 引擎相关内容
```

## 扫描剧本

### 项目结构与资源组织

- 搜索 `assets/`、`settings/`、`project.json`、`package.json`、`*.ts`、`*.js`
- 记录脚本目录、prefab 目录、bundle 目录、工具目录

### 组件脚本与挂载约定

- 搜索 `@ccclass`、`Component`、`property`、`Prefab`
- 只有命中真实组件脚本和场景/prefab 引用时，才能写挂载约定

### TypeScript / JavaScript 规范

- 搜索项目主语言、公共基类、命名模式、工具函数目录
- 不要只因存在 `tsconfig.json` 就断言项目主语言是 TypeScript

### 热更新与平台适配

- 搜索 `hotupdate`、`manifest`、`jsb`、小游戏平台关键字
- 只有命中发布脚本、平台适配代码或配置后，才能写流程规范

### UI / 场景 / 资源

- 搜索 `onClick`、`Button`、`director.loadScene`、`assetManager`、`resources.load`
- 必查项要继续追到项目自定义封装和调用落点

## 输出要求

- 运行时必查项优先写项目自定义组件、管理器、资源封装
- 不得把 Cocos 官方 API 默认用法当作项目结论
