---
  name: researcher-spec-builder
  tools: Read, Edit, Bash
  description: 接收调用方（builder 或 leader）的任务描述，执行 researcher spec 生成全流水线：阶段一模板复制 → 阶段二 MF/Tool 选择填充 → 阶段三 LLM 填充，输出可直接用于创建 researcher 队友的 spec 文件绝对路径。
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

  完成阶段一、二后，本 skill 再就工作文件内的三个 LLM 占位符做填充。

  > 注：所有脚本通过 `run.cjs` 启动，`run.cjs` 会自动推导插件根目录，输出到项目目录 `.seed/output/`。

  ### 脚本调用约定

  本 skill 中所有脚本均位于本插件的 `scripts/` 目录下。调用时使用插件安装的绝对路径，示例：

  ```
  node "<插件根目录>/scripts/run.cjs" "<插件根目录>/scripts/<脚本名>.mjs" [args...]
  ```

  其中 `<插件根目录>` 是本插件的实际安装路径（即加载本 skill 的插件位置）。
  **不要使用 `$CLAUDE_PLUGIN_ROOT` shell 变量，它在 Bash 工具中可能未被设置。**

  # Execution Flow

  **重要：以下 9 个步骤必须按顺序全部执行完毕。每一步完成后立即执行下一步，不得中途停止或等待额外指令。**

  **输入（调用方必须提供）：**
  ```
  任务描述：[自然语言，描述需要调查的问题]
  ```

  ## Step 1：阶段一 — 复制模板

  调用脚本 `researcher-copy-template.mjs`，参数：`--output .seed/output/`

  ```
  node "<插件根目录>/scripts/run.cjs" "<插件根目录>/scripts/researcher-copy-template.mjs" --output .seed/output/
  ```

  脚本将输出工作文件路径到 stdout。**记录此路径**，后续所有步骤均使用该路径。

  输出进度：
  ```
  ✓ Step 1：工作文件已创建 → [工作文件路径]
  ```

  ## Step 2：阶段二 — 列出 MF 选项

  调用脚本 `researcher-list-options.mjs`，参数：`--type mf`

  ```
  node "<插件根目录>/scripts/run.cjs" "<插件根目录>/scripts/researcher-list-options.mjs" --type mf
  ```

  脚本输出格式为 `ID | 描述`，每行一项。根据任务描述，判断哪些 MF 与本次调查最相关。

  输出进度：
  ```
  ✓ Step 2：MF 列表已获取
  ```

  ## Step 3：阶段二 — 填充 MF

  根据任务描述从 Step 2 选择 MF ID（可多选，第一个为主 MF；只选真正相关的，不过度选择）。

  ```
  node "<插件根目录>/scripts/run.cjs" "<插件根目录>/scripts/researcher-fill-options.mjs" --file [工作文件路径] --type mf --ids [id1,id2,...]
  ```

  输出进度：
  ```
  ✓ Step 3：MF 已填充（选中：[id1, id2, ...]）
  ```

  ## Step 4：阶段二 — 列出 Tool Skill 选项

  调用脚本 `researcher-list-options.mjs`，参数：`--type skill`

  ```
  node "<插件根目录>/scripts/run.cjs" "<插件根目录>/scripts/researcher-list-options.mjs" --type skill
  ```

  根据任务描述 + 已选 MF，判断需要哪些 Tool Skills。

  输出进度：
  ```
  ✓ Step 4：Tool Skill 列表已获取
  ```

  ## Step 5：阶段二 — 填充 Tool Skills

  从 Step 4 选择 Tool Skill ID（**不是全选**，只选当前任务真正需要的）。

  ```
  node "<插件根目录>/scripts/run.cjs" "<插件根目录>/scripts/researcher-fill-options.mjs" --file [工作文件路径] --type skill --ids [id1,id2,...]
  ```

  输出进度：
  ```
  ✓ Step 5：Tool Skills 已填充（选中：[id1, id2, ...]）
  ```

  ## Step 6：调用 current-task-contract-creator → 写入文件

  以 `Skill(current-task-contract-creator)` 方式启动 current-task-contract-creator，传入以下输入：
  ```
  工作文件：[工作文件路径]
  任务描述：[调用方原始描述]
  ```
  current-task-contract-creator 完成交互后，内部会自行调用 `researcher-inject-section.mjs` 将内容注入工作文件，输出 `✓ 已注入` 后返回。
  输出进度：
  ```
  ✓ Step 6：CTC 已写入
  ```
  立即继续执行 Step 7。

  ## Step 7：调用 delivery-contract-creator → 写入文件

  以 `Skill(delivery-contract-creator)` 方式启动 delivery-contract-creator，传入以下输入：
  ```
  工作文件：[工作文件路径]
  ```
  delivery-contract-creator 读取工作文件内容（已含 MF 和 CTC），生成 Delivery Contract 后，内部调用 `researcher-inject-section.mjs` 注入工作文件，输出 `✓ 已注入` 后返回。
  输出进度：
  ```
  ✓ Step 7：DC 已写入
  ```
  立即继续执行 Step 8。

  ## Step 8：调用 domain-context-creator → 写入文件

  以 `Skill(domain-context-creator)` 方式启动 domain-context-creator，传入以下输入：
  ```
  工作文件：[工作文件路径]
  ```
  domain-context-creator 读取工作文件内容，完成与调用方的问答后，内部调用 `researcher-inject-section.mjs` 注入工作文件，输出 `✓ 已注入` 后返回。
  输出进度：
  ```
  ✓ Step 8：Domain Context 已写入
  ```
  立即继续执行 Step 9。

  ## Step 9：完整性验证与输出结果

  读取工作文件，扫描是否存在残留占位符（格式为 `{...}`）。

  若有残留：列出未填充的占位符名称，终止并报告：
  ```
  × 以下占位符未填充：[占位符名称列表]
  ```

  若无残留，输出最终结果：
  ```
  ✓ Step 9：所有占位符已填充
  researcher spec 已完成。
  spec 文件路径：[工作文件绝对路径]
  ```

  ## Step 10：部署 spec 为 agent 定义

  **⚠ 这一步是关键 — 没有这一步，researcher teammate 不会加载你生成的 spec。**

  将 spec 文件的完整内容覆盖写入 Seed 插件的 agent 定义文件：
  ```
  目标路径：$CLAUDE_PLUGIN_ROOT/agents/researcher.md
  ```
  （`$CLAUDE_PLUGIN_ROOT` 即本 skill 文件所在目录的上两级。例如本 skill 在 `skills/researcher-spec-builder/SKILL.md`，则目标为同级的 `agents/researcher.md`。）

  用 Write 或 Edit 工具将 spec 内容完整写入目标路径，保留 YAML frontmatter。

  输出进度：
  ```
  ✓ Step 10：spec 已部署到 agents/researcher.md
  ```

  ## Step 11：创建 team 和 researcher 队友

  **spec 部署完成后，调用方必须立即执行以下步骤：**

  1. 如果还没有 team，先创建：`TeamCreate("{slug}")`
  2. Claude Code 创建 researcher teammate 时会自动加载已覆盖的 `agents/researcher.md`（即你的 spec）
  3. 用 `TaskCreate` 为 researcher 创建 `investigate` 任务
  4. 通过 `SendMessage` 向 researcher 发送调查启动消息
  5. 向用户报告 team 已启动、researcher 已开始调查

  **不要在部署 spec 后停止。上述 5 步必须全部完成。**

  # Language Constraints

  - 每步只输出一行进度，不输出中间草稿或分析过程
  - 不在工作文件以外的地方输出 spec 内容
  - 不修改工作文件中已由脚本填入的内容
  - 不得跳过任何步骤
