# Seed 团队路由表（项目级覆盖）

Leader 已内置默认路由表。本文件是**可选的项目级覆盖** — 如果存在 `.seed/team-router.md`，leader 优先使用其中的路由表替代内置默认值。

> **注意**：主 agent 自动担任 Leader 角色，以下表格仅列出 worker agent。不要将 leader 作为 teammate 创建。

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
| unity-runtime | module | researcher |
| unity-runtime | system | researcher |
| lua-gameplay | focused | researcher |
| lua-gameplay | module | researcher |
| lua-gameplay | system | researcher |
| ai-pipeline | focused | researcher |
| ai-pipeline | module | researcher |
| ai-pipeline | system | researcher |
| architecture | focused | researcher |
| architecture | module | researcher |
| architecture | system | researcher |
| cross-domain | focused | researcher |
| cross-domain | module | researcher |
| cross-domain | system | researcher |

> 仅当调查完成后需要写代码/实现时才追加 builder。纯调查/文档/架构梳理任务只需 researcher。

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
| unity-runtime | researcher |
| lua-gameplay | researcher |
| ai-pipeline | researcher |
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

| Worker 数 | 组成 | 适用场景 |
|-----------|------|---------|
| 1 | 你（leader）+ 1 worker | Focused、单领域任务 |
| 2 | 你（leader）+ 2 workers | Module 级任务，或需要验证的任务 |
| 3 | 你（leader）+ 3 workers | System 级任务，跨领域工作 |
| 3+ | — | 先将任务拆分为更小的 bud 调用 |

## 定制化

要覆盖 leader 的内置路由：

1. 将此文件复制到 `.seed/team-router.md`（setup-init 会自动完成）
2. 编辑表格以匹配你的项目需求
3. Leader 检测到 `.seed/team-router.md` 存在时，会优先使用它
4. 常见定制：
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
