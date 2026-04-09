---
name: embed-researcher-lua
description: /seed:embed Lua researcher 扫描剧本
triggers:
  - embed lua researcher
  - lua scan
  - bridge scan
domain:
  - project-analysis
scope:
  - agent-inject
---

## 加载顺序

创建 `researcher-lua` 前，必须先加载：

1. `seed/skills/embed/researcher-common.md`
2. `seed/skills/embed/researcher-runtime-common.md`
3. `seed/skills/embed/researcher-lua.md`

## TaskCreate 模板

```text
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: Lua 调查报告（SendMessage 给 leader 与 builder-lua）
Done Definition: 报告先输出通用规则执行结果，再输出运行时必查项结果，最后输出 Lua 领域发现；每条结论附证据路径；若运行时必查项缺失，则按 researcher-runtime-common 输出必查项缺失错误
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目 Lua 技术栈，为生成 skill 文件提供依据
Scope Coverage: Lua 模块组织、桥接层（xLua/tolua/SLua）、热更新模式、C#-Lua 互调、错误处理、日志规范
Exclusions: 纯 C# 层代码、Unity Editor 功能、配置表数据
```

## 扫描剧本

### Lua 模块组织

- 先找 Lua 根目录，如 `Lua/`、`Scripts/Lua/`、`Assets/Lua/`
- 搜索 `require(`、`dofile(`、模块返回表、模块初始化入口
- 只有在定位到实际模块入口与依赖写法后，才能总结模块系统

### 桥接层

- 搜索 `XLua`、`LuaInterface`、`SLua`、`DoString`、`LuaEnv`、`CSharpCallLua`、`LuaCallCSharp`
- 同时回查 C# 侧桥接入口与 Lua 侧调用点
- 若只有 detect-tech-stack 的框架命中，没有实际互调代码，不得写互调约定

### 热更新模式

- 搜索 `Hotfix`、`patch`、`reload`、`hotupdate`、Lua 重载入口
- 只有命中实际热更入口、发布脚本或补丁加载流程，才能写热更新规范

### Lua 与 C# 互调方式

- 追踪“Lua 调 C#”和“C# 调 Lua”各自的实际实现
- 重点找：委托注册、桥接配置、函数绑定、回调入口
- 没找到双向互调证据时，不要补写通用桥接知识

### 错误处理与日志

- 搜索 `pcall`、`xpcall`、`error(`、`print(`、`logger`、`LogError`
- 记录项目里真实存在的错误封装和日志前缀

### Lua 对外 API

- 搜索启动入口、业务模块公共表、事件注册函数、Facade/Manager 层的 Lua 代理
- 只记录被实际调用的对外 API，不列猜测中的接口

## 输出要求

- 必须先回答运行时必查项，再写 Lua 领域发现
- 若按钮/UI/资源等实现主要在 Lua 层，优先给出 Lua 实现路径
- 若实现横跨 Lua 和 C#，两侧证据都要记录
