---
  name: researcher-spec-builder
  tools: Read, Edit, Bash
  description: 接收脚本初始化后的工作文件路径，依次调用 current-task-contract-creator / delivery-contract-creator / domain-context-creator，将输出写入工作文件对应占位符，完成 researcher spec 的 LLM 填充阶段。
---

  # 架构说明

  researcher spec 的生成分为三个阶段，职责严格分离：

  ## 阶段一：模板复制（脚本，无逻辑）

  纯文件操作，不做任何内容判断。

  调用插件内脚本 `scripts/researcher-copy-template.mjs`（通过 `scripts/run.cjs` 启动），参数：`--output .seed/output/`

  - 读取 `templates/researcher/researcher.md`
  - 复制为 `.seed/output/researcher-[YYYYMMDD-HHMM].md`
  - 输出工作文件路径，供后续步骤使用

---

  ## 阶段二：选择填充（Script 列出 → LLM 判断 → Script 写入）

  MF 和 Tool Skills 的选择遵循同一模式：
  1. Script 列出所有可用选项（只做文件枚举，不做判断）
  2. LLM 根据 builder 描述判断选哪些
  3. Script 将选中项内容写入工作文件

  ### MF 选择

  调用插件内脚本 `scripts/researcher-list-options.mjs`，参数：`--type mf`
  输出 `templates/researcher/mf/` 目录下所有 MF 文件的 ID 和一行描述，供 LLM 判断。

  LLM 根据 builder 描述选出 MF ID 列表（可多选，第一个为主 MF）。

  调用插件内脚本 `scripts/researcher-fill-options.mjs`，参数：`--file [工作文件路径] --type mf --ids [id1,id2,...]`
  按顺序读取对应 MF 文件内容，拼接后写入 `{selected_method_fragments}`。

---

  ### Tool Skills 选择

  调用插件内脚本 `scripts/researcher-list-options.mjs`，参数：`--type skill`
  输出 `templates/researcher/tools/` 目录下所有 Tool Skill 文件的 ID 和一行描述，供 LLM 判断。

  LLM 根据 builder 描述 + 已选 MF 判断需要哪些 Tool Skills（不是全选）。

  调用插件内脚本 `scripts/researcher-fill-options.mjs`，参数：`--file [工作文件路径] --type skill --ids [id1,id2,...]`
  读取对应 Tool Skill 文件内容，写入 `{selected_tool_skills}`。

---

  ## 阶段三：LLM 填充（本 skill 负责）

  本 skill 接收阶段一、二已处理的工作文件，完成需要语言理解的三个占位符填充。

  **启动条件：** 工作文件必须已存在，`{selected_method_fragments}` 和 `{selected_tool_skills}` 必须已填充，`{task_contract}` / `{delivery_contract}` / `{domain_context}` 必须仍为占位符状态。

  若条件不满足，终止并报告：`× 工作文件状态异常，请先完成阶段一和阶段二`

  > 注：所有脚本通过 `run.cjs` 启动，`run.cjs` 会自动推导插件根目录，输出到项目目录 `.seed/output/`。

  ### 脚本调用约定

  本 skill 中所有脚本均位于本插件的 `scripts/` 目录下。调用时使用插件安装的绝对路径，示例：

  ```
  node "<插件根目录>/scripts/run.cjs" "<插件根目录>/scripts/<脚本名>.mjs" [args...]
  ```

  其中 `<插件根目录>` 是本插件的实际安装路径（即加载本 skill 的插件位置）。
  **不要使用 `$CLAUDE_PLUGIN_ROOT` shell 变量，它在 Bash 工具中可能未被设置。**

  # Execution Flow

  **重要：以下 5 个步骤必须按顺序全部执行完毕。每一步完成后，立即执行下一步，不得在中间停止或等待用户指令。**

  ## Step 1：验证工作文件状态

  读取工作文件，确认：
  - `{selected_method_fragments}` 已填充
  - `{selected_tool_skills}` 已填充
  - `{task_contract}` 仍为占位符
  - `{delivery_contract}` 仍为占位符
  - `{domain_context}` 仍为占位符

  输出进度：
  ```
  ✓ Step 1：工作文件状态正常 → [工作文件路径]
  ```

  ## Step 2：调用 current-task-contract-creator → 写入文件

  以 `Skill(current-task-contract-creator)` 方式启动 current-task-contract-creator，传入以下输入：
  ```
  工作文件：[工作文件路径]
  任务描述：[builder 原始描述]
  ```
  current-task-contract-creator 完成交互后，内部会自行调用 `researcher-inject-section.mjs` 将内容注入工作文件，输出 `✓ 已注入` 后返回。
  输出进度：
  ```
  ✓ Step 2：CTC 已写入
  ```
  立即继续执行 Step 3。

  ## Step 3：调用 delivery-contract-creator → 写入文件

  以 `Skill(delivery-contract-creator)` 方式启动 delivery-contract-creator，传入以下输入：
  ```
  工作文件：[工作文件路径]
  ```
  delivery-contract-creator 读取工作文件内容（已含 MF 和 CTC），生成 Delivery Contract 后，内部调用 `researcher-inject-section.mjs` 注入工作文件，输出 `✓ 已注入` 后返回。
  输出进度：
  ```
  ✓ Step 3：DC 已写入
  ```
  立即继续执行 Step 4。

  ## Step 4：调用 domain-context-creator → 写入文件

  以 `Skill(domain-context-creator)` 方式启动 domain-context-creator，传入以下输入：
  ```
  工作文件：[工作文件路径]
  ```
  domain-context-creator 读取工作文件内容，完成与 builder 的问答后，内部调用 `researcher-inject-section.mjs` 注入工作文件，输出 `✓ 已注入` 后返回。
  输出进度：
  ```
  ✓ Step 4：Domain Context 已写入
  ```
  立即继续执行 Step 5。

  ## Step 5：完整性验证

  读取工作文件，扫描是否存在残留占位符（格式为 `{...}`）。

  若有残留：列出未填充的占位符名称，终止并报告：
  ```
  × 以下占位符未填充：[占位符名称列表]
  ```

  若无残留：
  ```
  ✓ Step 5：所有占位符已填充
  文件路径：[工作文件路径]
  researcher spec 已完成，可直接交给 researcher 执行。
  ```

  # Language Constraints

  - 每步只输出一行进度，不输出中间草稿或分析过程
  - 不在工作文件以外的地方输出 spec 内容
  - 不修改工作文件中已由脚本填入的内容
  - 不得跳过任何步骤
