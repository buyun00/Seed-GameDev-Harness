---
name: detect-tech-stack
description: 确定性技术栈指纹检测规则，供 /seed:embed Step 0 调用。所有检测结论必须基于物理证据（文件存在 / 字符串匹配），禁止模型自行推断。
triggers:
  - 技术栈检测
  - 引擎识别
  - 框架指纹
  - embed Step 0
domain:
  - project-analysis
scope:
  - agent-inject
---

## 核心原则

1. **只做物理查找**：每条规则的结论来自「文件是否存在」或「字符串是否出现」，不做语义推断。
2. **找到即记录证据路径**：结论格式为 `找到（证据：Assets/XLua/ 目录存在）`，或 `未找到`，禁止写「可能是」「疑似」。
3. **互斥项按优先级顺序检查**：找到第一个匹配即停止，不继续查后续选项。
4. **证据冲突时全部保留**：如同时找到 xLua 和 tolua 的证据，两个都列出，在 Step 1 交给用户确认，不自行裁决。
5. **输出格式固定**：必须输出结构化报告（见末尾模板），不允许自由发挥描述。

---

## Phase 1：引擎识别

**规则（互斥，按顺序检查，找到即停）**

```
检查 1：ProjectSettings/ProjectVersion.txt 是否存在
  → 存在 → 引擎 = Unity
  → 记录版本：读取该文件第一行 m_EditorVersion 字段值

检查 2：project.godot 是否存在（项目根目录）
  → 存在 → 引擎 = Godot
  → 记录版本：读取 project.godot 中 config_version 字段值

检查 3：*.uproject 文件是否存在（项目根目录）
  → 存在 → 引擎 = Unreal
  → 记录版本：读取该 .uproject 文件中 EngineAssociation 字段值

检查 4：package.json 是否存在 AND 其内容是否含 "creator"
  → 满足 → 引擎 = Cocos Creator
  → 记录版本：读取 package.json 中 version 字段

检查 5：以上全不满足
  → 引擎 = 无引擎（工具链 / 纯代码项目）
```

---

## Phase 2：主要语言分布

**统计以下扩展名的文件数量（使用 glob 全量统计，排除 Library/、Temp/、node_modules/）**

| 扩展名 | 语言 |
|---|---|
| *.cs | C# |
| *.lua | Lua |
| *.gd | GDScript |
| *.ts | TypeScript |
| *.js | JavaScript |
| *.py | Python |
| *.cpp / *.h | C++ |

**输出规则**：
- 数量最多的为「主语言」
- 数量 > 0 的其余语言全部列入「辅助语言」
- 数量 = 0 的语言不出现在报告中

---

## Phase 3：各框架指纹查找

### 3-A：Lua 桥接（互斥，按优先级顺序检查）

仅在 Phase 2 检测到 *.lua 文件数量 > 0 时执行此 Phase。

```
优先级 1：xLua
  证据 A：Assets/XLua/ 目录是否存在
  证据 B：Packages/manifest.json 中是否含字符串 "com.tencent.xlua"
  证据 C：任意 *.cs 文件中是否含字符串 "using XLua;"
  → 任意一条满足 → lua_bridge = xlua，记录命中的证据

优先级 2：tolua
  证据 A：Assets/ToLua/ 目录是否存在
  证据 B：Assets/LuaFramework/ 目录是否存在
  证据 C：任意 *.cs 文件中是否含字符串 "using LuaInterface;"
  → 任意一条满足 → lua_bridge = tolua，记录命中的证据

优先级 3：SLua
  证据 A：Assets/Slua/ 目录是否存在
  证据 B：任意 *.cs 文件中是否含字符串 "using SLua;"
  → 任意一条满足 → lua_bridge = slua，记录命中的证据

优先级 4：自研桥接
  → 以上三条全部未找到，但 *.lua 文件数量 > 0
  → lua_bridge = custom，证据 = "存在 Lua 文件但未找到已知桥接特征"

兜底：
  → *.lua 文件数量 = 0
  → lua_bridge = none
```

### 3-B：UI 框架（可多选，各自独立检查，全部检查完再汇总）

仅在引擎为 Unity 时执行此 Phase。

```
FairyGUI：
  证据 A：Assets/FairyGUI/ 目录是否存在
  证据 B：Packages/manifest.json 中是否含 "com.fairygui"
  证据 C：任意 *.cs 中是否含 "using FairyGUI;"
  → 任意满足 → ui_frameworks 列表加入 fairygui

UI Toolkit：
  证据 A：项目中是否存在任意 *.uxml 文件
  证据 B：项目中是否存在任意 *.uss 文件
  证据 C：任意 *.cs 中是否含 "UnityEngine.UIElements"
  → 任意满足 → ui_frameworks 列表加入 ui_toolkit

UGUI：
  证据 A：任意 *.cs 中是否含 "UnityEngine.UI"
  证据 B：Assets/UI/ 或 Assets/UGUI/ 目录是否存在
  → 任意满足 → ui_frameworks 列表加入 ugui

注意：三个 UI 框架可以共存，不互斥。
如果三者都未找到证据 → ui_frameworks = unknown
```

### 3-C：热更方案（可多选，各自独立检查）

仅在引擎为 Unity 时执行此 Phase。

```
HybridCLR：
  证据 A：Assets/HybridCLR/ 目录是否存在
  证据 B：Packages/manifest.json 中是否含 "com.code-philosophy.hybridclr"
  → 任意满足 → hot_update 列表加入 hybridclr

ILRuntime：
  证据 A：Assets/ILRuntime/ 目录是否存在
  证据 B：任意 *.cs 中是否含 "using ILRuntime;"
  → 任意满足 → hot_update 列表加入 ilruntime

xLua 热补丁：
  前置条件：lua_bridge = xlua（Phase 3-A 已确认）
  证据 A：任意 *.cs 中是否含字符串 "[Hotfix]"
  → 满足 → hot_update 列表加入 xlua_hotfix

tolua 热更新：
  前置条件：lua_bridge = tolua（Phase 3-A 已确认）
  → tolua 框架本身即含热更能力，无需额外证据
  → 直接加入 hot_update 列表：tolua_hotupdate

无热更：
  → 以上全部未找到 → hot_update = none
```

### 3-D：资源管理（可多选，各自独立检查）

仅在引擎为 Unity 时执行此 Phase。

```
Addressables：
  证据 A：Packages/manifest.json 中是否含 "com.unity.addressables"
  证据 B：Assets/AddressableAssetsData/ 目录是否存在
  → 任意满足 → asset_management 列表加入 addressables

AssetBundle 自管理：
  证据 A：任意 *.cs 中是否含 "BuildPipeline.BuildAssetBundles"
  证据 B：是否存在包含 "AssetBundle" 关键字的构建脚本目录（如 Editor/Build/、Tools/AB/）
  → 任意满足 → asset_management 列表加入 assetbundle_manual

无特殊资源管理：
  → 两者全未找到 → asset_management = default_resources
```

### 3-E：配置表

```
Excel 导出：
  证据 A：项目中是否存在 *.xlsx 或 *.xls 文件（排除 Library/）
  证据 B：是否存在包含 "ExcelExport" / "TableExport" 关键字的脚本
  → 任意满足 → config_format 列表加入 excel

Proto / FlatBuffers：
  证据 A：项目中是否存在 *.proto 文件
  证据 B：项目中是否存在 *.fbs 文件
  → 任意满足 → config_format 列表加入 proto_flatbuffers

自定义 JSON / YAML：
  证据 A：Assets/ 或 Resources/ 下是否存在批量 *.json 文件（数量 > 10）
  证据 B：是否存在 *.yaml 数据文件目录
  → 任意满足 → config_format 列表加入 custom_json_yaml

无配置表：
  → 以上全未找到 → config_format = none
```

### 3-F：网络层

```
Mirror：
  证据：Packages/manifest.json 含 "com.unity.mirror"
  OR Assets/Mirror/ 目录存在
  → network 列表加入 mirror

Netcode for GameObjects：
  证据：Packages/manifest.json 含 "com.unity.netcode.gameobjects"
  → network 列表加入 netcode

Godot 内置多人游戏：
  前置条件：引擎 = Godot
  证据：任意 *.gd 中含 "MultiplayerAPI" 或 "NetworkedVar"
  → network 列表加入 godot_multiplayer

自研网络框架：
  证据 A：存在包含 "Socket" / "Protobuf" / "KCP" / "TCP" 关键字的自定义网络目录
  证据 B：任意 *.cs 含 "System.Net.Sockets"（非第三方库内）
  → network 列表加入 custom_network

无网络：
  → 以上全未找到 → network = none
```

### 3-G：Godot 特有检测（仅引擎 = Godot 时执行）

```
GDScript 版本：
  检查 project.godot 中 config_version 值
    4 → Godot 4.x，GDScript 2.0 语法
    3 → Godot 3.x，GDScript 1.0 语法

C# 支持：
  证据：*.csproj 文件是否存在于项目根目录
  → 存在 → godot_csharp = true

导出配置：
  证据：export_presets.cfg 文件是否存在
  → 存在 → has_export_config = true
```

### 3-H：Unreal 特有检测（仅引擎 = Unreal 时执行）

```
Blueprint 使用：
  证据：Content/ 目录下是否存在 *.uasset 文件（Blueprint 资产）
  → 存在 → unreal_blueprint = true

C++ 模块：
  证据：Source/ 目录是否存在 AND 其中是否有 *.cpp 文件
  → 存在 → unreal_cpp = true

插件：
  证据：Plugins/ 目录是否存在
  → 存在 → 列出 Plugins/ 下的一级子目录名称
```

### 3-I：Cocos Creator 特有检测（仅引擎 = Cocos 时执行）

```
语言确认：
  证据 A：是否存在 *.ts 文件 → language = typescript
  证据 B：是否存在 *.js 文件（且无 .ts）→ language = javascript

热更方案：
  证据 A：是否存在 hot-update / hotupdate 相关目录
  证据 B：package.json 中是否含 "jszip"（热更常用依赖）
  → 任意满足 → cocos_hotupdate = true

小游戏平台：
  检查 package.json 中 dependencies / devDependencies 是否含：
    "minigame-canvas-engine" 或 wx / wechat 相关关键字
  → 满足 → platform 列表加入 wechat_minigame
```

### 3-J：其他集成（所有项目都执行）

```
MCP 集成：
  证据 A：.mcp.json 文件是否存在
  证据 B：项目中是否存在 mcp-server / mcp_server 目录
  → 任意满足 → mcp_integration = true

AI Pipeline：
  证据 A：.seed/ 目录是否存在
  证据 B：是否存在 agent / pipeline 相关目录
  → 任意满足 → ai_pipeline = true

CI/CD：
  证据 A：.github/workflows/ 目录是否存在
  证据 B：.gitlab-ci.yml 文件是否存在
  证据 C：Jenkinsfile 是否存在
  → 任意满足 → cicd = true，记录类型

自动化测试：
  证据 A：Assets/Tests/ 目录是否存在（Unity）
  证据 B：*.test.ts / *.spec.ts 文件是否存在
  → 任意满足 → has_tests = true
```

---

## Phase 4：输出结构化检测报告

**所有 Phase 执行完毕后，必须输出以下格式的报告，字段全部填写，未找到的填 none 或 false，禁止省略字段。**

```yaml
tech_stack_report:
  engine:
    name: unity | godot | unreal | cocos | none
    version: "2022.3.15f1"         # 从文件读取，读不到填 unknown
    evidence: "ProjectSettings/ProjectVersion.txt 存在"

  languages:
    primary: cs                    # 文件数最多的
    secondary: [lua]               # 其余有文件的语言列表
    file_counts:
      cs: 342
      lua: 187
      # 只列出数量 > 0 的

  lua_bridge:
    type: xlua | tolua | slua | custom | none
    evidence: "Assets/XLua/ 目录存在"

  ui_frameworks:
    - type: fairygui
      evidence: "using FairyGUI; 出现在 UIManager.cs"
    - type: ugui
      evidence: "UnityEngine.UI 出现在多个文件"
    # 空列表填 []

  hot_update:
    - type: hybridclr | ilruntime | xlua_hotfix | tolua_hotupdate | none
      evidence: "Assets/HybridCLR/ 目录存在"
    # 空列表填 []

  asset_management:
    - type: addressables | assetbundle_manual | default_resources
      evidence: "com.unity.addressables 在 manifest.json 中"
    # 空列表填 []

  config_format:
    types: [excel, proto_flatbuffers, custom_json_yaml, none]
    evidence: "Assets/Config/ 下存在 47 个 .xlsx 文件"

  network:
    types: [mirror, netcode, godot_multiplayer, custom_network, none]
    evidence: "com.unity.mirror 在 manifest.json 中"

  integrations:
    mcp: true | false
    ai_pipeline: true | false
    cicd: true | false
    cicd_type: github_actions | gitlab_ci | jenkins | none
    has_tests: true | false

  # 仅当对应引擎时出现
  godot_extra:
    gdscript_version: "2.0"
    has_csharp: true | false
    has_export_config: true | false

  unreal_extra:
    has_blueprint: true | false
    has_cpp: true | false
    plugins: ["OnlineSubsystem", "Wwise"]

  cocos_extra:
    language: typescript | javascript
    has_hotupdate: true | false
    platforms: [wechat_minigame]

  conflicts: []
  # 如果同一分类找到多个互斥证据，在此列出，例如：
  # - field: lua_bridge
  #   found: [xlua, tolua]
  #   reason: "Assets/XLua/ 和 Assets/ToLua/ 都存在"
```

---

## 异常处理规则

| 情况 | 处理方式 |
|---|---|
| 项目根目录无法确定 | 停止检测，输出错误：`root_error: 无法确定项目根目录` |
| manifest.json 解析失败 | 跳过所有依赖 manifest.json 的检查，在对应字段标注 `evidence: manifest.json 读取失败` |
| 某个 Phase 整体失败 | 该 Phase 所有字段填 `unknown`，不影响其他 Phase |
| 找到互斥证据 | 全部保留，写入 `conflicts` 字段，Step 1 交用户确认 |
| 文件数量巨大（>5000 .cs）| 字符串搜索改为只扫描 Assets/ 一级子目录的 *.cs，不递归 |
