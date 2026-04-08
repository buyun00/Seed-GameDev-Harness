---
name: lua-scripting
description: Lua 开发规范和 xlua bridge 使用技巧
triggers:
  - lua
  - xlua
  - hotfix
  - 热更
  - table
  - coroutine
  - require
---

## Lua Scripting Patterns

### xlua Bridge

- **C# 导出到 Lua**: 使用 `[LuaCallCSharp]` 标记需要在 Lua 侧调用的类和接口。`[CSharpCallLua]` 用于 C# 调用 Lua 委托。
- **Hotfix 模式**: `[Hotfix]` 标记的类可以在运行时被 Lua 替换方法实现。生产环境中只在需要热修复的类上标记。
- **类型映射**: `int/float/string/bool` 自动映射。`Vector3` 等 Unity 值类型需要在 `GenConfig` 里注册生成代码，否则会走反射（性能差）。
- **内存管理**: Lua 侧持有的 C# 对象引用会阻止 GC。用 `xlua.release()` 主动释放，或在 Lua table 回收时自动释放。

### Lua 编码规范

- **模块模式**: 每个文件返回一个 table 作为模块:
  ```lua
  local M = {}
  function M.init() ... end
  return M
  ```
- **避免全局变量**: 所有变量用 `local` 声明。模块间通信通过 `require` 返回的 table。
- **table 作为类**: 使用 metatable 实现继承:
  ```lua
  local Base = {}
  Base.__index = Base
  function Base.new()
    return setmetatable({}, Base)
  end
  ```
- **字符串拼接**: 避免循环中用 `..` 拼接（每次创建新字符串），改用 `table.concat`。

### Coroutine (Lua)

- Lua 协程和 Unity 协程是两套独立系统。xlua 提供 `util.cs_generator` 把 Lua 协程包装成 C# `IEnumerator`。
- **`coroutine.yield()`** 挂起当前协程，**`coroutine.resume()`** 恢复。Lua 协程不会自动调度，需要手动管理。
- 协程中的错误不会传播到调用者，需要检查 `coroutine.resume()` 的返回值。

### 调试

- **print / CS.UnityEngine.Debug.Log**: Lua 侧调试输出。注意 `print` 在某些嵌入环境可能被重定向或禁用。
- **xlua.hotfix**: 运行时热替换方法用于调试:
  ```lua
  xlua.hotfix(CS.SomeClass, 'MethodName', function(self, arg)
    print('intercepted:', arg)
    -- call original or new logic
  end)
  ```
- **Lua Profiler**: 如果项目集成了 LuaPerfect 或 LuaProfiler，用它来定位 Lua 侧的性能瓶颈。

### 常见陷阱

- `nil` 和 `false` 在 Lua 中都是 falsy，但它们不相等 (`nil ~= false`)
- table 长度 `#t` 只对序列部分有效（连续整数键从 1 开始），有 hole 时行为未定义
- `require` 有缓存机制，同一模块只执行一次。需要重新加载时用 `package.loaded[name] = nil`
