<!-- SEED:START -->
<!-- SEED:VERSION:0.1.0 -->

# Seed GameDev AI 系统

## 语言
检查 `.seed/config.json` → `language`。如果已设置，在整个 session 中所有回复、代码注释、文档、任务描述和 agent 通信都必须使用该语言。

## 核心原则
- 事实可以分散流动，方向必须集中裁决
- 主 agent 自动担任 Leader — 每个 session 开始时通过 hook 注入 leader 身份
- 任务板（TaskCreate）是持久协调面
- Mailbox（SendMessage）是低延迟沟通面

## Agent Team 使用
直接对主 agent 说任务即可 — 主 agent 自动担任 Leader，会根据任务规模分级并决定是否创建 team。
- 轻量任务 → Leader 直接处理
- 标准/重型任务 → Leader 自动创建 team 并协调 worker agent
- `/seed` 命令是可选的结构化入口，适用于需要 guided/confirm 模式手动调整参数的场景

普通文本 `SendMessage` 必须带 `summary` 字段。关闭 teammate 时必须使用结构化 `shutdown_request` / `shutdown_response`，所有活跃 teammate 退出后再调用 `TeamDelete`；`TeamDelete` 不接收 `team_name`、`message` 或最终摘要，最终摘要在删除成功后输出给用户。

## 任务升级原则
以下情况 teammate 必须升级给 leader，不得自行决策：
- 实现方案有多个方向可选
- 发现依赖关系变化影响其他任务
- 遇到 Risk Level = high 的情况
- 任何"要不要改这个"的疑问

## 记忆系统
项目上下文存储在 .seed/project-memory.json
会话笔记存储在 .seed/notepad.md
这些文件会在每次 session 开始时自动注入

<!-- SEED:END -->
