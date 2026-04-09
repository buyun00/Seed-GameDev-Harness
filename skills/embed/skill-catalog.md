---
name: embed-skill-catalog
description: /seed:embed Step 3 domain skill 生成映射表
triggers:
  - embed step3
  - skill catalog
  - domain skill 映射
domain:
  - project-analysis
scope:
  - agent-inject
---

## 用途

本文件承接 `/seed:embed` Step 3 的长表逻辑。
根据 Step 1 已确认的答案与 Step 2 的补充结果，动态决定需要生成哪些 skill 文件。

## 各条件对应的 skill 文件

### 所有项目（必选）

| 文件 | 说明 |
|---|---|
| `domain/project-structure.md` | 项目目录结构和模块划分 |
| `domain/project-conventions.md` | 项目通用约定（命名、注释、提交规范等） |

### Unity 项目

| 文件 | 说明 |
|---|---|
| `domain/unity-project-structure.md` | Unity 项目目录组织方式 |
| `domain/unity-scene-management.md` | 场景管理和加载方式 |
| `domain/unity-lifecycle.md` | MonoBehaviour 生命周期使用约定 |
| `domain/unity-prefab-conventions.md` | Prefab 命名、组织、引用约定 |
| `domain/unity-serialization.md` | 序列化字段约定和 SO 使用规范 |

### C# 层（Unity 或其他）

| 文件 | 说明 |
|---|---|
| `domain/csharp-coding-rules.md` | 代码风格、命名规范、文件组织 |
| `domain/csharp-architecture.md` | C# 层架构设计（框架选型、分层约定） |
| `domain/csharp-patterns.md` | 项目常用设计模式和惯用写法 |
| `domain/csharp-async.md` | 异步处理方式（async/await / coroutine 约定） |
| `domain/csharp-testing.md` | 单元测试规范和测试组织方式 |

### Lua 层

| 文件 | 说明 |
|---|---|
| `domain/lua-architecture.md` | Lua 层模块组织和架构设计 |
| `domain/lua-coding-rules.md` | Lua 编码规范（命名、注释、文件结构） |
| `domain/lua-module-system.md` | 模块加载和依赖管理方式 |
| `domain/lua-gameplay-api.md` | Lua 层对外暴露的主要 API 和接口约定 |
| `domain/lua-error-handling.md` | 错误处理和日志规范 |

### xLua 桥接

| 文件 | 说明 |
|---|---|
| `domain/xlua-bridge-rules.md` | xLua 桥接层约定（哪些走桥接、如何组织） |
| `domain/xlua-hotfix-patterns.md` | 热补丁使用规范和注意事项 |
| `domain/xlua-interop-conventions.md` | C# 与 Lua 互调约定和最佳实践 |

### tolua 桥接

| 文件 | 说明 |
|---|---|
| `domain/tolua-bridge-rules.md` | tolua 桥接层约定 |
| `domain/tolua-coroutine.md` | tolua 协程使用规范 |

### SLua 桥接

| 文件 | 说明 |
|---|---|
| `domain/slua-bridge-rules.md` | SLua 桥接层约定 |

### UGUI

| 文件 | 说明 |
|---|---|
| `domain/ugui-component-rules.md` | UI 组件命名和组织约定 |
| `domain/ugui-layout-conventions.md` | 布局规范（锚点、自适应等） |
| `domain/ugui-prefab-conventions.md` | UI Prefab 组织和复用约定 |
| `domain/ugui-event-system.md` | 事件系统使用规范 |

### FairyGUI

| 文件 | 说明 |
|---|---|
| `domain/fairygui-component-rules.md` | FairyGUI 组件命名和组织约定 |
| `domain/fairygui-binding-patterns.md` | FairyGUI 与代码层绑定方式 |
| `domain/fairygui-export-rules.md` | 导出设置和资源管理约定 |

### UI Toolkit（Unity）

| 文件 | 说明 |
|---|---|
| `domain/ui-toolkit-conventions.md` | UXML/USS 命名和组织约定 |
| `domain/ui-toolkit-binding-patterns.md` | 数据绑定方式 |

### HybridCLR

| 文件 | 说明 |
|---|---|
| `domain/hybridclr-setup.md` | HybridCLR 配置和构建流程 |
| `domain/hybridclr-restrictions.md` | 热更代码限制和注意事项 |
| `domain/hybridclr-update-flow.md` | 热更发布和回滚流程 |

### ILRuntime

| 文件 | 说明 |
|---|---|
| `domain/ilruntime-setup.md` | ILRuntime 配置和初始化 |
| `domain/ilruntime-restrictions.md` | 热更代码约束和注意事项 |

### Addressables

| 文件 | 说明 |
|---|---|
| `domain/addressables-organization.md` | 资源分组和标签组织约定 |
| `domain/addressables-loading.md` | 加载和释放规范 |

### AssetBundle 自管理

| 文件 | 说明 |
|---|---|
| `domain/assetbundle-build-pipeline.md` | AssetBundle 构建流程和分包策略 |
| `domain/assetbundle-loading.md` | 运行时加载和卸载规范 |

### 配置表（Excel 导出）

| 文件 | 说明 |
|---|---|
| `domain/config-schema.md` | 配置表字段规范和类型约定 |
| `domain/config-workflow.md` | 配置表制作、导出、热更流程 |
| `domain/config-validation.md` | 配置数据校验规范 |

### 策划文档

| 文件 | 说明 |
|---|---|
| `domain/design-document-format.md` | 策划文档格式规范 |
| `domain/design-review-process.md` | 策划评审和变更流程 |

### 网络层

| 文件 | 说明 |
|---|---|
| `domain/network-protocol.md` | 网络协议设计约定 |
| `domain/network-error-handling.md` | 网络异常处理规范 |

### MCP 集成

| 文件 | 说明 |
|---|---|
| `domain/mcp-integration.md` | MCP 工具使用规范和接口约定 |

### AI pipeline

| 文件 | 说明 |
|---|---|
| `domain/ai-pipeline-conventions.md` | AI 工作流设计约定 |
| `domain/agent-collaboration.md` | Agent 协作规范 |

### Godot 项目

| 文件 | 说明 |
|---|---|
| `domain/godot-project-structure.md` | Godot 项目目录和节点组织方式 |
| `domain/godot-scene-conventions.md` | Scene/Node 命名和组织约定 |
| `domain/godot-signals.md` | Signal 使用规范和事件通信约定 |
| `domain/gdscript-coding-rules.md` | GDScript 编码规范 |

### Unreal 项目

| 文件 | 说明 |
|---|---|
| `domain/unreal-project-structure.md` | Unreal 项目目录和模块组织 |
| `domain/unreal-blueprint-conventions.md` | Blueprint 命名和组织约定 |
| `domain/unreal-cpp-coding-rules.md` | C++ 编码规范（命名、模块划分） |
| `domain/unreal-gameplay-framework.md` | GameMode/GameState/PlayerController 使用约定 |

### Cocos Creator 项目

| 文件 | 说明 |
|---|---|
| `domain/cocos-project-structure.md` | Cocos 项目目录和资源组织方式 |
| `domain/cocos-component-conventions.md` | 组件脚本命名和挂载约定 |
| `domain/cocos-typescript-rules.md` | TypeScript 编码规范 |
| `domain/cocos-hotupdate.md` | 热更新方案配置和流程（如有） |

## 灵活性原则

1. 根据项目实际扫描结果，判断哪些 skill 真正有必要创建
2. 如果扫描发现了上表未列出的技术方案或项目特有约定，主动创建对应 skill，不要因为没在列表里就跳过
3. 如果某个 skill 在当前项目中找不到对应代码或文档，创建占位文件，并在 frontmatter 中标注 `source: incomplete`
4. skill 粒度保持单一职责，一个文件只覆盖一个具体知识点

## 展示给用户确认

整理出完整的文件列表，标注每个文件的状态，用 `AskUserQuestion` 确认：

- 展示格式必须同时包含：`文件名 | 作用说明 | 状态`
- `作用说明` 优先复用上面各表中的说明列；执行时动态新增的 skill 也必须补一句用途说明
- `状态` 至少区分：`新建`、`已存在，将覆盖`、`已存在，--update 下跳过`

示例：

```text
根据你的选择，将生成以下 skill 文件：

.seed/skills/domain/
  project-structure.md        | 项目目录结构和模块划分               | 新建
  project-conventions.md      | 项目通用约定（命名、注释、提交规范等） | 新建
  unity-project-structure.md  | Unity 项目目录组织方式               | 新建
  unity-prefab-conventions.md | Prefab 命名、组织、引用约定          | 新建
  csharp-coding-rules.md      | 代码风格、命名规范、文件组织          | 新建
  ...

共 N 个文件。预计需要 3-5 分钟。
```

`AskUserQuestion` 不可用时，降级为普通文本确认。
