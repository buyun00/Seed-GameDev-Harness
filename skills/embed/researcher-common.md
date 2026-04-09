---
name: embed-researcher-common
description: /seed:embed researcher 通用物理证据协议与调查报告结构
triggers:
  - embed researcher
  - 物理证据
  - 调查报告
domain:
  - project-analysis
scope:
  - agent-inject
---

## 用途

本文件是所有 `/seed:embed` researcher 的第一层通用协议。

加载顺序固定为：

1. 先加载 `seed/skills/embed/researcher-common.md`
2. 运行时 researcher 再加载 `seed/skills/embed/researcher-runtime-common.md`
3. 再加载 `seed/skills/embed/taxonomy-registry.md`
4. 再加载各自的 `seed/skills/embed/researcher-<domain>.md`
5. 最后按本次负责的 `matrix_id` 加载对应的 fixed question 文件；如存在匹配的 composite fixed question 文件，再追加加载

## 核心元规则

1. **只做物理查找，不做语义推断。**
   结论只能来自文件存在、目录存在、字符串命中、调用链命中、配置字段命中。

2. **找不到代码就不写。**
   禁止用框架通用知识、常见写法、经验默认值补空。
   没找到就是没找到，必须明确写 `未找到` 或错误。

3. **每条结论都必须带证据。**
   证据至少包含以下三类中的两类，能给三类更好：
   - 证据路径：命中的文件或目录路径
   - 命中串：实际命中的关键词、类型名、方法名、字段名
   - 实现落点：继续追踪后确认的实现文件/函数/类

4. **先搜索，后写报告。**
   先执行搜索、定位、追踪，再整理结论。
   禁止先写结论再回头找证据。

5. **维度标签不是答案。**
   像“UI 组件结构”“网络层协议”“桥接层约定”这类标签，必须先转成可搜索的问题句，再开始扫描。

6. **接口、注释、命名不足以单独成立结论。**
   如果只找到接口声明、空基类、注释、TODO、文档标题，而没有实际调用或实现，不得写成“项目就是这么做的”。

7. **冲突证据全部保留。**
   如果同一问题命中多套实现或多条可疑路径，全部列出并说明冲突，不自行裁决。

## 禁止事项

- 禁止写“通常会”“一般来说”“框架默认”“大概率”“推测是”
- 禁止把搜索关键词本身当作项目结论
- 禁止只因为看到 `UnityEngine.UI` 就推断按钮绑定一定使用 `Button.onClick.AddListener`
- 禁止只因为看到 `SceneManager`、`Addressables`、`AssetBundle`、`Signal` 等框架词，就推断具体封装层存在
- 禁止在报告中补写任何未命中的 API 名、事件名、生命周期模式

## 通用搜索流程

1. 先根据当前领域文件给出的目录与关键词做第一轮定向搜索
2. 对命中项继续向上/向下追踪调用链，找到实际实现落点
3. 如果第一轮没找到，扩大到全仓库搜索
4. 扩大搜索时排除明显的三方、缓存、生成产物目录
   常见排除项：`Library/`、`Temp/`、`Logs/`、`Obj/`、`node_modules/`、`DerivedDataCache/`、`.git/`
5. 仍没找到时，记录已搜索范围和关键词，再输出 `未找到` 或对应错误

## 固定问题加载规则

researcher 不仅要扫描领域剧本，还必须按本次负责的矩阵项加载对应固定问题文件。

加载顺序：

1. 先加载矩阵项自己的 `fixed_question_file`
2. 如存在匹配的 composite fixed question 文件，再追加加载
3. 用这些固定问题驱动本次具体搜索

约束：

- 固定问题文件缺失时，必须在报告里明确写出缺失路径
- 固定问题文件缺失，不等于 researcher 可以自由补写问题
- 如果领域剧本与固定问题冲突，以固定问题文件为准；领域剧本只提供搜索范围和追踪方式

## 证据记录格式

每条结论按以下格式记录：

```yaml
- finding: "简短结论"
  status: found | not_found | conflict | error
  evidence_paths:
    - "路径 A"
    - "路径 B"
  matched_strings:
    - "命中串 A"
    - "命中串 B"
  implementation:
    - "最终实现文件/类/函数"
  searched_scopes:
    - "已搜索目录或文件范围"
  searched_keywords:
    - "已搜索关键词"
  note: "必要时补充一句说明；无则省略"
```

## 调查报告结构

所有 researcher 的最终报告必须按以下三段输出，顺序不可变：

1. **通用规则执行结果**
   记录本次实际搜索范围、排除项、冲突项、是否存在仅文档无实现的情况。

2. **运行时必查项结果**
   只有运行时 researcher 输出；非运行时 researcher 写 `N/A`。

3. **领域发现**
   仅写实际命中的项目实现与证据，不写框架常识总结。

## 交付约束

- 报告接收方始终是 `leader` 和对应 `builder-*`
- 报告要让 builder 可以直接消费，不需要再做猜测
- 如果证据不足以支持写出规范，明确告诉 builder 该处只能产出占位 skill
