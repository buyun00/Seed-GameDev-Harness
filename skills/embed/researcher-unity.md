---
name: embed-researcher-unity
description: /seed:embed Unity/C# researcher 扫描剧本
triggers:
  - embed unity researcher
  - unity scan
  - csharp scan
domain:
  - project-analysis
scope:
  - agent-inject
---

## 加载顺序

创建 `researcher-unity` 前，必须先加载：

1. `seed/skills/embed/researcher-common.md`
2. `seed/skills/embed/researcher-runtime-common.md`
3. `seed/skills/embed/researcher-unity.md`

## TaskCreate 模板

```text
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: Unity/C# 调查报告（SendMessage 给 leader 与 builder-unity）
Done Definition: 报告先输出通用规则执行结果，再输出运行时必查项结果，最后输出 Unity/C# 领域发现；每条结论附证据路径；若运行时必查项缺失，则按 researcher-runtime-common 输出必查项缺失错误
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目 Unity/C# 技术栈，为生成 skill 文件提供依据
Scope Coverage: Unity 项目结构、场景管理、生命周期约定、Prefab 组织、序列化规范、C# 编码风格、架构分层、设计模式、异步处理、测试规范
Exclusions: Lua 层代码、配置表数据、基础设施
```

## 扫描剧本

### 目录结构与模块划分

- 先看 `Assets/` 一级目录、`Packages/manifest.json`、`*.asmdef`
- 重点记录运行时代码、编辑器代码、UI、Scene、Prefab、Tests、Framework 目录
- 不要只列目录名，要说明目录在项目中的职责，并附证据路径

### MonoBehaviour 使用约定

- 搜索 `: MonoBehaviour`、`Awake(`、`Start(`、`OnEnable(`、`Update(`、`FixedUpdate(`
- 关注项目是否有统一基类，如 `BaseView`、`UIBehaviour`、`GameBehaviour`、`SingletonMono`
- 只有在命中具体基类和实际子类时，才能写“项目有统一生命周期封装”

### Prefab 组织和命名规范

- 搜索 `.prefab` 所在目录、`PrefabUtility`、`Resources/`、`AddressableAssetsData/`
- 关注 UI Prefab、角色 Prefab、场景内嵌对象的组织方式
- 命名规范必须基于实际 prefab 文件名或构建脚本，不可凭常见做法推断

### UI 组件结构

- 搜索项目自己的 UI 基类、UI Manager、View/Panel/Window 目录
- 同时搜索 `UnityEngine.UI`、`using FairyGUI;`、`UnityEngine.UIElements`、`.uxml`、`.uss`
- 只把命中的项目实现写进报告；不要因为命中框架 namespace 就推导出事件绑定方式

### 序列化与 ScriptableObject

- 搜索 `[SerializeField]`、`ScriptableObject`、`CreateAssetMenu`、`SerializeReference`
- 关注配置载体、运行时数据载体、编辑器资源定义
- 只有命中具体资产类型和使用点，才能总结约定

### C# 架构与模式

- 搜索 `Manager`、`Service`、`System`、`Controller`、`Facade`、`Locator`、`EventBus`、`Signal`
- 关注 asmdef 分层、命名空间分层、框架入口、依赖方向
- 必须同时给出类型定义和实际调用点，才能写“项目采用某种分层/模式”

### 异步处理

- 搜索 `StartCoroutine`、`IEnumerator`、`async`、`await`、`Task`、`UniTask`
- 记录项目真实采用的异步主路径，不要把所有命中项都写成主流方案

### 测试代码

- 搜索 `Assets/Tests/`、`Tests/`、`EditMode`、`PlayMode`、`[Test]`、`[UnityTest]`
- 未找到时明确写未找到，不要默认有 Unity Test Framework

## 输出要求

- 运行时必查项必须先回答，再写 Unity/C# 维度发现
- 每条 Unity/C# 结论都要带证据路径和命中串
- 若按钮绑定/UI 开关/场景切换/资源释放等关键实现只在项目自定义封装中出现，必须优先写自定义封装，不要退回写框架 API 常识
