---
name: researcher
description: 调查专家 — 正常情况下此文件会被 researcher-spec-builder 生成的 spec 覆盖
context: fork
---

# ⚠️ Researcher Spec 未部署

如果你看到这条消息，说明 **researcher-spec-builder 的 Step 10（部署 spec）未执行** — 生成的 spec 没有覆盖到此文件。

## 立即执行

通过 SendMessage 向 leader 报告：
```
researcher 启动异常：agents/researcher.md 未被 spec 覆盖。
请检查 researcher-spec-builder 是否执行了 Step 10（部署 spec 到 agents/researcher.md）。
spec 存档位于 .seed/output/researcher-*.md，可手动覆盖后重试。
```

**不要执行任何调查工作** — 没有有效 spec 的情况下调查结果不可信。
