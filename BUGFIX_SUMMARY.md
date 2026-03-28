# Bug Fix Summary - 2026-03-28

## 修复的问题

### 1. 白屏问题（后两个板块）✅
**原因**: 省份选择器的值和 `PROVINCIAL_DATA` 的键不匹配
- `Province` 枚举的值是完整名称（如 `'Ontario'`）
- `PROVINCIAL_DATA` 的键是缩写（如 `'ON'`）
- `taxEngine.ts` 期望的是缩写键，但收到的是完整名称，抛出 "Invalid province" 错误

**修复**:
- `AnnualSalaryInput.tsx`: 使用 `Object.entries(PROVINCIAL_DATA)` 并设置 `value={key}`
- `TimesheetInput.tsx`: 已正确，无需修改
- `InputSection.tsx`: 更新为使用 `Object.entries(PROVINCIAL_DATA)` 和 `value={key}`
- `App.tsx`: 将默认省份值从 `Province.ON` 改为 `'ON'`
- `useUserSettings.ts`: 将默认省份值从 `Province.ON` 改为 `'ON'`

### 2. 计算记录和 Timesheet 菜单无反应 ✅
**原因**: 功能未实现（有 TODO 注释）

**修复**:
- 创建 `useCalculationHistory.ts` hook 来管理计算历史
- 更新 `UserMenu.tsx`:
  - 添加计算历史弹窗
  - 实现加载历史记录功能
  - 实现删除历史记录功能
  - "My Timesheets" 菜单点击会切换到 Timesheet 模式
- 更新 `App.tsx`:
  - 集成计算历史功能
  - 添加 "Save Calculation" 按钮到结果区域
  - 实现从历史记录加载计算的功能

### 3. 计算历史逻辑优化 ✅
**方案**: 手动保存 + 本地缓存
- 用户点击 "Save Calculation" 按钮才会保存当前计算
- 计算历史同时保存到 Supabase 和 localStorage
- 未登录用户也能使用本地缓存功能

## 数据库更新

需要在 Supabase SQL Editor 中运行以下文件：

```sql
-- 运行此文件创建 calculation_history 表
ADD_CALCULATION_HISTORY.sql
```

### 表结构

```sql
CREATE TABLE calculation_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('simple', 'annual', 'timesheet')),
  name TEXT NOT NULL,
  province TEXT NOT NULL,
  inputs JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 新功能

### 1. 保存计算
- 在计算结果右上角添加 "Save Calculation" 按钮
- 保存成功后会显示 "Saved!" 提示（2秒后消失）

### 2. 计算历史
- 点击头像 → "Calculation History" 查看历史记录
- 显示计算模式图标、名称、日期和净收入
- 支持加载历史记录（恢复到当时的输入）
- 支持删除单条记录或清空所有历史

### 3. Timesheet 快捷入口
- 点击头像 → "My Timesheets" 快速切换到 Timesheet 模式

## 文件修改列表

1. `components/AnnualSalaryInput.tsx` - 修复省份选择器
2. `components/InputSection.tsx` - 修复省份选择器
3. `components/UserMenu.tsx` - 实现菜单功能
4. `hooks/useCalculationHistory.ts` - 新建计算历史 hook
5. `hooks/useUserSettings.ts` - 修复默认省份值
6. `App.tsx` - 集成计算历史功能
7. `ADD_CALCULATION_HISTORY.sql` - 新建数据库表

## 部署步骤

1. 在 Supabase SQL Editor 中运行 `ADD_CALCULATION_HISTORY.sql`
2. 部署前端代码
3. 测试三个计算模式是否正常工作
4. 测试保存计算和历史记录功能

## 注意事项

- 省份值现在统一使用缩写格式（如 'ON', 'BC', 'AB'）
- 历史记录同时保存在 Supabase 和 localStorage
- 未登录用户使用 'anonymous' 作为 user_id 保存到 Supabase
