---
name: embed-fixed-questions-readme
description: /seed:embed 固定问题文件的目录结构与加载规则
domain:
  - project-analysis
scope:
  - agent-inject
---

# Fixed Questions

本目录不再使用“单一总表”存放固定问题，而是按矩阵项拆分文件，方便分类编写、局部维护和复合叠加。

## 目录规则

### 引擎主线矩阵项

- 路径：`fixed-questions/engine/<engine>/<direction-kebab>.md`
- 例：
  - `fixed-questions/engine/unity/hot-reload.md`
  - `fixed-questions/engine/godot/ui-system.md`

### 跨引擎能力矩阵项

- 路径：`fixed-questions/capability/<capability-kebab>.md`
- 例：
  - `fixed-questions/capability/lua-embedding.md`
  - `fixed-questions/capability/data-config-pipeline.md`

### 复合叠加矩阵项

- 路径：`fixed-questions/composite/<engine>/<direction-kebab>/<capability-kebab>.md`
- 用途：只写“引擎方向 + capability”交叉后才成立的附加问题
- 例：
  - `fixed-questions/composite/unity/bridge-layer/lua-embedding.md`
  - `fixed-questions/composite/unity/hot-reload/lua-embedding.md`

## 加载顺序

1. 先加载矩阵项本身的固定问题文件
2. 如果存在匹配的 composite 文件，再追加加载
3. composite 只追加问题，不覆盖基础矩阵项问题

## 文件写法

每个固定问题文件统一采用以下结构：

- frontmatter
  - `engine` / `capability` 文件包含：`matrix_id`、`owner`、`question_set_id`
  - `composite` 文件包含：`composite_id`、`owner`、`researcher_owner`、`capability_owner`
- `## 填写说明`
- `## 固定问题`
  - 每道题都使用同一题目块结构：
    - `id`
    - `question`
    - `must_find`
    - `fatal_if_missing`
    - `search_hints`
      - `paths`
      - `keywords`
    - `report_fields`

补充约定：

- 不再使用文件级 `## 搜索提示` / `## 交叉搜索提示`
- `search_hints` 统一写在每一道题下面
- `report_fields` 默认统一为：`evidence_paths`、`matched_strings`、`implementation`

## 当前落地范围

本轮已预建：

- 全部引擎主线矩阵项模板
  - `engine.<engine>.<direction_id>`
- 全部 capability 矩阵项模板
  - `capability.<capability_id>`

目前已预建第一批高价值 composite 模板，路径位于：

- `fixed-questions/composite/<engine>/<direction-kebab>/<capability-kebab>.md`

其余仍按需创建的是：

- 尚未进入首批高价值集合的 composite 叠加固定问题文件
  - `composite.<engine>.<direction_id>.<capability_id>`

说明：

- 已经写过实际内容的文件会保留内容，不会被模板覆盖
- 新增固定问题文件不得以 `question: TODO` 作为可发布状态；占位题只允许存在于开发中草稿，发布前必须补成可搜索的问题句
