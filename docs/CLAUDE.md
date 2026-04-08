<!-- SEED:START -->
<!-- SEED:VERSION:0.1.0 -->

# Seed GameDev AI 系统

## 语言
检查 `.seed/config.json` → `language`。如果已设置，在整个 session 中所有回复、代码注释、文档、任务描述和 agent 通信都必须使用该语言。

## 核心原则
- 事实可以分散流动，方向必须集中裁决
- Leader 永远是 team 的方向仲裁者
- 任务板（TaskCreate）是持久协调面
- Mailbox（SendMessage）是低延迟沟通面

## Agent Team 使用
需要启动多 agent 协作时，使用 /seed:bud 命令。
系统会根据任务特征自动选择 agent 组合。

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
