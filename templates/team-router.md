# Seed 团队路由表

本文件定义了 `/seed`（`/seed:bud`）如何根据任务特征选择 agent。
你可以通过编辑 `.seed/team-router.md` 来按项目定制此文件。

> **注意**：Leader 始终包含在每个团队中，以下表格不再列出。

---

## implement

| 领域 | 复杂度 | agents |
|------|--------|--------|
| unity-runtime | focused | builder, unity-pilot |
| unity-runtime | module | builder, unity-pilot |
| unity-runtime | system | builder, reviewer, unity-pilot |
| lua-gameplay | focused | builder |
| lua-gameplay | module | builder |
| lua-gameplay | system | builder, reviewer |
| ai-pipeline | focused | builder |
| ai-pipeline | module | builder |
| ai-pipeline | system | builder |
| architecture | focused | builder, reviewer |
| architecture | module | builder, reviewer |
| architecture | system | builder, reviewer |
| cross-domain | focused | builder, reviewer |
| cross-domain | module | builder, reviewer |
| cross-domain | system | builder, reviewer |

## investigate

| 领域 | 复杂度 | agents |
|------|--------|--------|
| unity-runtime | focused | researcher |
| unity-runtime | module | researcher, builder |
| unity-runtime | system | researcher, builder |
| lua-gameplay | focused | researcher |
| lua-gameplay | module | researcher, builder |
| lua-gameplay | system | researcher, builder |
| ai-pipeline | focused | researcher |
| ai-pipeline | module | researcher, builder |
| ai-pipeline | system | researcher, builder |
| architecture | focused | researcher |
| architecture | module | researcher, builder |
| architecture | system | researcher, builder |
| cross-domain | focused | researcher, builder |
| cross-domain | module | researcher, builder |
| cross-domain | system | researcher, builder |

## fix

对于 fix 任务，路由取决于根因是否已知。

### 根因已知

| 领域 | agents |
|------|--------|
| unity-runtime | builder, unity-pilot |
| lua-gameplay | builder |
| ai-pipeline | builder |
| architecture | builder |
| cross-domain | builder |

### 根因未知

| 领域 | agents |
|------|--------|
| unity-runtime | researcher, builder, unity-pilot |
| lua-gameplay | researcher, builder |
| ai-pipeline | researcher, builder |
| architecture | researcher, builder |
| cross-domain | researcher, builder |

## review

| 领域 | agents |
|------|--------|
| unity-runtime | reviewer, unity-pilot |
| lua-gameplay | reviewer |
| ai-pipeline | reviewer |
| architecture | reviewer |
| cross-domain | reviewer |

## design

| 复杂度 | agents |
|--------|--------|
| focused | researcher, builder |
| module | researcher, builder |
| system | researcher, builder, reviewer |

## operate

| agents |
|--------|
| unity-pilot |

---

## 团队规模指南

| 规模 | 组成 | 适用场景 |
|------|------|---------|
| 2 | leader + 1 | Focused、单领域任务 |
| 3 | leader + 2 | Module 级任务，或需要验证的任务 |
| 4 | leader + 3 | System 级任务，跨领域工作 |
| 4+ | — | 先将任务拆分为更小的 bud 调用 |

## 定制化

要为你的项目定制路由：

1. 将此文件复制到 `.seed/team-router.md`（setup-init 会自动完成）
2. 编辑表格以匹配你的项目需求
3. 常见定制：
   - 某些领域始终包含 reviewer
   - 需要 Editor 验证的领域添加 unity-pilot
   - 移除不需要的 agent（如项目没有 Lua）

---

## Domain 与 Skill 映射

/seed:bud 启动 team 时，根据识别出的 domain 从 .seed/skills/ 和
$CLAUDE_PLUGIN_ROOT/skills/ 中选取 scope 包含 agent-inject 且
domain 匹配的 skill，注入到对应 teammate 的 system prompt。

| domain | 典型注入 skill |
|---|---|
| unity-runtime | unity-patterns.md、unity-ui-workflow.md |
| lua-gameplay | lua-scripting.md、lua-conventions.md、lua-xlua-bridge.md |
| ai-pipeline | ai-pipeline.md、mcp-tools.md |
| architecture | 视具体任务从多个 domain 选取 |
| cross-domain | 合并相关 domain 的 skill |

每个 teammate 最多注入 3 个 skill，避免 system prompt 过大。
实际注入以磁盘上存在的文件为准。
