---
name: fixed-questions-capability-tooling-and-ai-pipeline
description: 工具链与 AI Pipeline 固定问题模板
matrix_id: capability.tooling_and_ai_pipeline
axis: capability
capability: tooling_and_ai_pipeline
capability_id: tooling_and_ai_pipeline
owner: researcher-infra
question_set_id: qs-common-tooling-and-ai-pipeline
scope:
  - agent-inject
---

## 填写说明

- 本文件是 capability.tooling_and_ai_pipeline 的固定问题模板。
- 补充 MCP、Agent、工程工具链、自动化和 AI workflow 上的固定问题。
- 后续填写时，只写该 capability 自己必须回答的问题，不要把引擎主线问题写进来。

## 固定问题

- id: capability_tooling_and_ai_pipeline_q1
  question: 项目级工具链入口在哪里，开发者通过哪些脚本、命令、Editor 工具或任务文件启动自动化？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `Tools/`
      - `Editor/`
      - `Scripts/`
      - `.vscode/`
      - `.idea/`
      - `package.json`
      - `Makefile`
      - `README.md`
    keywords:
      - `tool`
      - `script`
      - `task`
      - `automation`
      - `MenuItem`
      - `command`
      - `npm run`
      - `make`
      - `editor`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_tooling_and_ai_pipeline_q2
  question: MCP、Agent、Seed、Claude、Codex 或其他 AI 工作流配置是否存在，入口文件和作用边界在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `.mcp.json`
      - `.seed/`
      - `.claude/`
      - `.codex/`
      - `agents/`
      - `skills/`
      - `commands/`
      - `README.md`
    keywords:
      - `mcp`
      - `agent`
      - `skill`
      - `seed`
      - `claude`
      - `codex`
      - `automation`
      - `workflow`
      - `prompt`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_tooling_and_ai_pipeline_q3
  question: 代码生成、绑定生成、资源索引生成、协议生成或配置生成工具在哪里，生成产物如何与手写代码隔离？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `Tools/`
      - `Editor/`
      - `Scripts/`
      - `Assets/`
      - `Generated/`
      - `Source/Generate/`
    keywords:
      - `Generate`
      - `Generator`
      - `Generated`
      - `CodeGen`
      - `Binding`
      - `Protocol`
      - `Config`
      - `Index`
      - `Auto`
      - `LuaBinder`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_tooling_and_ai_pipeline_q4
  question: 工具链的输入、输出、缓存、日志和状态目录在哪里，哪些内容可删除或可再生成？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `Tools/`
      - `Build/`
      - `Generated/`
      - `Temp/`
      - `Cache/`
      - `Logs/`
      - `.seed/`
    keywords:
      - `cache`
      - `tmp`
      - `temp`
      - `log`
      - `state`
      - `generated`
      - `output`
      - `clean`
      - `rebuild`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_tooling_and_ai_pipeline_q5
  question: 项目是否有团队路由、任务模板、代码评审模板、变更模板或提示词资产，放在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `.seed/`
      - `.github/`
      - `.claude/`
      - `.codex/`
      - `docs/`
      - `templates/`
      - `agents/`
      - `skills/`
    keywords:
      - `template`
      - `task`
      - `review`
      - `agent`
      - `router`
      - `prompt`
      - `plan`
      - `checklist`
      - `workflow`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_tooling_and_ai_pipeline_q6
  question: 自动化 hooks、pre-commit、post-tool、precompact、CI 辅助脚本或会话脚本在哪里配置？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `.git/hooks/`
      - `.husky/`
      - `.seed/`
      - `.claude/`
      - `.codex/`
      - `scripts/`
      - `hooks/`
      - `.github/workflows/`
    keywords:
      - `hook`
      - `pre-commit`
      - `post-tool`
      - `precompact`
      - `session`
      - `automation`
      - `lint-staged`
      - `trigger`
      - `event`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_tooling_and_ai_pipeline_q7
  question: 工具链是否包含验证、格式化、静态检查、报告校验或健康检查入口？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `scripts/`
      - `Tools/`
      - `Editor/`
      - `Tests/`
      - `.github/workflows/`
      - `package.json`
    keywords:
      - `validate`
      - `verify`
      - `check`
      - `lint`
      - `format`
      - `test`
      - `health`
      - `report`
      - `gate`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_tooling_and_ai_pipeline_q8
  question: 工具链依赖的外部服务、CLI、SDK、环境变量或密钥在哪里声明，如何避免写死到仓库？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `.env`
      - `.env.example`
      - `package.json`
      - `requirements.txt`
      - `pyproject.toml`
      - `.github/workflows/`
      - `README.md`
      - `docs/`
    keywords:
      - `env`
      - `secret`
      - `token`
      - `api_key`
      - `SDK`
      - `CLI`
      - `install`
      - `dependency`
      - `credentials`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_tooling_and_ai_pipeline_q9
  question: AI 或自动化生成的计划、报告、记忆、缓存和 domain skill 输出落在哪里，是否与项目源码隔离？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `.seed/`
      - `.claude/`
      - `.codex/`
      - `docs/`
      - `reports/`
      - `state/`
      - `skills/`
    keywords:
      - `memory`
      - `notepad`
      - `report`
      - `state`
      - `domain`
      - `skill`
      - `plan`
      - `cache`
      - `generated`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_tooling_and_ai_pipeline_q10
  question: 工具链和 AI workflow 的使用说明、维护边界、升级流程或故障排查文档在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `README.md`
      - `docs/`
      - `doc/`
      - `.seed/`
      - `.claude/`
      - `.codex/`
      - `Tools/`
      - `文档/`
    keywords:
      - `tool`
      - `workflow`
      - `agent`
      - `mcp`
      - `seed`
      - `setup`
      - `install`
      - `troubleshoot`
      - `upgrade`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths: []
    keywords: []
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
