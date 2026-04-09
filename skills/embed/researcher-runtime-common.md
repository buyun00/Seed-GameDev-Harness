---
name: embed-researcher-runtime-common
description: /seed:embed 运行时 researcher 必查项与缺失报错协议
triggers:
  - embed runtime researcher
  - 必查项
  - 运行时调查
domain:
  - project-analysis
scope:
  - agent-inject
---

## 适用范围

按 `taxonomy-registry.md` 的双轴矩阵，本文件服务的是“需要回答运行时固定问题”的 owner，而不是“所有与运行时相关的分类”。

### 引擎主线 owner

- `researcher-unity`
- `researcher-godot`
- `researcher-unreal`
- `researcher-cocos`

### 跨引擎能力 owner

- `researcher-lua`

说明：

- `researcher-lua` 属于 capability owner，不是 engine owner。
- 它加载本文件，不代表它与 Unity / Godot / Unreal / Cocos 属于同一分类层级；只代表 Lua 嵌入能力经常直接承载这 5 个运行时实现问题，必须按同一硬约束输出证据。
- `researcher-config` 不加载本文件。
- `researcher-infra` 也不加载本文件；基础设施能力改由独立 capability researcher 处理，不再承担 UI / 场景 / 资源这 5 个运行时主线必查项。

## 运行时必查项

以下 5 个问题是运行时项目中的强制调查点。每项都必须找到**实际实现**，否则必须报错：

1. 按钮点击是怎么绑定的？有没有统一封装层？
2. UI 界面/面板是怎么打开和关闭的？
3. 模块/系统之间怎么互相调用或通信？
4. 场景或关卡是怎么切换加载的？
5. 资源是在哪里加载、在哪里释放的？

## 搜索流程

### 第一轮：定向搜索

先搜索高价值目录名、类型名、方法名、文件名，优先关注项目自己的封装层。

推荐目录/命名线索：

- `UI`、`UIView`、`Panel`、`Window`、`Dialog`、`Screen`
- `Module`、`System`、`Manager`、`Controller`、`Service`
- `Scene`、`Level`、`Stage`
- `Asset`、`Resource`、`Loader`、`Pool`
- `Event`、`Message`、`Signal`、`Bus`

推荐关键词仅用于搜索，不得直接写成结论：

- 按钮绑定：`Click`、`OnClick`、`AddListener`、`EventTrigger`、`Bind`、`Register`、`UIEvent`
- UI 开关：`Open`、`Close`、`Show`、`Hide`、`Push`、`Pop`
- 系统通信：`Dispatch`、`Notify`、`Send`、`Broadcast`、`EventBus`、`Signal`、`Message`
- 场景切换：`LoadScene`、`ChangeScene`、`EnterLevel`、`LoadLevel`、`Stage`
- 资源生命周期：`Load`、`Unload`、`Release`、`Instantiate`、`Destroy`、`Pool`

### 第二轮：追实现

命中后必须继续追踪到实际实现：

- 从按钮组件追到点击回调注册点
- 从 UI 基类或 Manager 追到打开/关闭入口
- 从消息名或事件总线追到订阅/派发实现
- 从场景名或关卡入口追到加载方法
- 从资源封装 API 追到加载与释放落点

如果只停在接口、抽象基类、常量、命名约定，不算完成。

### 第三轮：扩大搜索

第一轮未定位到实现时，必须扩大到全仓库继续查。

扩大搜索时要：

- 保留已搜目录与关键词列表
- 排除明显三方、缓存、生成目录
- 优先查项目根下的脚本目录、运行时目录、工具目录、编辑器目录、配置目录

## 缺失处理

扩大搜索后仍找不到任一必查项时：

1. 不允许把该项写成 `incomplete` 就结束
2. 必须输出 `必查项缺失错误`
3. 错误中必须包含：
   - 问题名
   - 已搜索范围
   - 已搜索关键词
   - 为什么仍无法确认实现
4. 明确告诉 builder：该方向只能生成占位 skill，不得补写推断性规则

## 必查项输出格式

每个必查项只能输出两种状态之一：

```yaml
- question: "按钮点击是怎么绑定的？有没有统一封装层？"
  status: found
  evidence_paths:
    - "Assets/Scripts/UI/UIBinder.cs"
  matched_strings:
    - "BindClick"
    - "RegisterButton"
  implementation:
    - "Assets/Scripts/UI/MainMenuView.cs: SetupButtons"
```

或

```yaml
- question: "按钮点击是怎么绑定的？有没有统一封装层？"
  status: error
  error_type: "必查项缺失错误"
  searched_scopes:
    - "Assets/Scripts/UI/"
    - "Assets/Scripts/Runtime/"
  searched_keywords:
    - "Click"
    - "OnClick"
    - "Bind"
    - "Register"
  note: "扩大到全仓库后仍未找到按钮绑定实现或统一封装。"
```

## Builder 协议

如果报告里存在任意 `必查项缺失错误`：

- builder 只能生成占位 skill
- `source` 必须写 `incomplete`
- 正文首段必须明确写出缺失项与已搜索范围
- 禁止 builder 用项目外知识补写默认规范
