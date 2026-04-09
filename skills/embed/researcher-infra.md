---
name: embed-researcher-infra
description: /seed:embed 基础设施 researcher 扫描剧本
triggers:
  - embed infra researcher
  - infrastructure scan
  - pipeline scan
domain:
  - project-analysis
scope:
  - agent-inject
---

## 加载顺序

创建 `researcher-infra` 前，必须先加载：

1. `seed/skills/embed/researcher-common.md`
2. `seed/skills/embed/researcher-runtime-common.md`
3. `seed/skills/embed/researcher-infra.md`

## TaskCreate 模板

```text
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: 基础设施调查报告（SendMessage 给 leader 与 builder-infra）
Done Definition: 报告先输出通用规则执行结果，再输出运行时必查项结果，最后输出基础设施领域发现；每条结论附证据路径；若运行时必查项缺失，则按 researcher-runtime-common 输出必查项缺失错误
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目基础设施，为生成 skill 文件提供依据
Scope Coverage: 资源管理方式（Addressables/AssetBundle）、构建和热更发布流程、CI/CD 配置、网络层协议、其他工具链
Exclusions: 游戏逻辑代码、Lua 层实现、UI 组件细节
```

## 扫描剧本

### 资源管理

- 搜索 `com.unity.addressables`、`AddressableAssetsData/`、`BuildAssetBundles`、`AssetBundle`、自定义 Loader/Provider
- 同时回查加载与释放调用点，不能只看构建脚本

### 构建与热更发布

- 搜索 `BuildPipeline`、`BuildPlayer`、`BuildScript`、`hotupdate`、`release`、CI 配置
- 关注从资源构建到发布的完整链路

### CI/CD

- 搜索 `.github/workflows/`、`gitlab-ci.yml`、`Jenkinsfile`、构建批处理/PowerShell
- 记录实际运行的检查、构建、发布步骤

### 网络层

- 搜索 `Socket`、`KCP`、`TCP`、`UDP`、`Protobuf`、`Mirror`、`Netcode`
- 必须定位到协议定义或传输封装，不要只因为依赖存在就写网络规范

### MCP / AI pipeline / 工具链

- 搜索 `mcp`、`agent`、`pipeline`、自动化工具目录、脚本入口
- 只记录项目内真实存在的工具链整合方式

## 输出要求

- 资源加载/释放既属于基础设施维度，也属于运行时必查项；两处都要给证据
- 若网络层只有依赖声明、没有实际协议或传输实现，不得补写网络约定
