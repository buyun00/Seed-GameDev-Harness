---
name: unity-patterns
description: Unity 开发常见模式和调试技巧（物理、动画、协程）
triggers:
  - rigidbody
  - physics
  - collider
  - jump
  - 物理
  - animator
  - animation
  - coroutine
version: 1.0
domain:
  - unity-runtime
scope:
  - user-chat
  - agent-inject
tags:
  - unity
  - physics
  - animation
source: manual
---

## Unity 开发模式

### 物理

- **固定时间步长**：物理在 FixedUpdate 中以固定间隔运行（Edit > Project Settings > Time）。所有物理逻辑应放在 `FixedUpdate()` 中，而不是 `Update()`。
- **Rigidbody.velocity 直接赋值会绕过物理模拟**，优先用 `AddForce()`。如果必须直接设值（如跳跃），在 `FixedUpdate` 中操作。
- **Collider 尺寸不匹配**是常见 bug 来源：检查 Scale、Collider Size、Physics Material 三者的配合。
- **层碰撞矩阵**：检查 Edit > Project Settings > Physics 的碰撞矩阵，某些层之间可能被禁用了碰撞。
- **连续碰撞检测**：高速物体（子弹、快速角色）需要设置 `Rigidbody.collisionDetectionMode = ContinuousDynamic`，否则会穿模。

### 动画

- **Animator Controller 状态机**：状态转换条件如果有多个参数，检查是否有死锁（两个条件互斥导致永远无法转换）。
- **Root Motion vs 脚本驱动**：`Animator.applyRootMotion` 开启时，动画会控制 Transform 位移，和脚本的位移控制冲突。通常二选一。
- **动画事件**：动画事件触发时，如果目标 MonoBehaviour 被禁用或销毁，会静默失败，不会报错。
- **Blend Tree 调试**：在 Animator 窗口的 Parameters 面板实时观察参数值，确认 blend 权重是否符合预期。

### 协程

- **`yield return null`** 等到下一帧 Update 后执行，**`yield return new WaitForFixedUpdate()`** 等到下一次 FixedUpdate。
- **协程在 GameObject 被 Disable 时自动停止**，重新 Enable 不会恢复。需要手动重启。
- **不要在协程中做长时间阻塞操作**，用 `yield return new WaitForSeconds()` 或 `yield return new WaitUntil(() => condition)` 替代。
- **协程嵌套**：`yield return StartCoroutine(OtherCoroutine())` 可以等待另一个协程完成。

### 调试技巧

- **Physics.Raycast 可视化**：使用 `Debug.DrawRay()` 或 Scene 视图的 Physics Debugger 来可视化射线。
- **Time.timeScale = 0 时 Update 仍然执行**，但 FixedUpdate 停止，`WaitForSeconds` 也停止。用 `Time.unscaledDeltaTime` 和 `WaitForSecondsRealtime` 处理暂停菜单。
- **Profiler**：Window > Analysis > Profiler 是性能问题的第一调查工具。关注 GC Alloc 列。
