# Alert Form 默认货币选择改进

## 改进内容

当用户点击某个货币旁边的 Alert 按钮（🔔）时，弹出的创建表单会**自动选中当前货币**，无需用户再次手动选择。

## 改进前后对比

### 改进前 ❌
```
用户点击 DOGE 的 Alert 按钮
  ↓
弹出表单
  ↓
标题显示: "Create Price Alert for DOGE" ✓
当前价格: "$0.172" ✓
Cryptocurrency 下拉框: "Select a cryptocurrency" ❌ (未选中)
  ↓
用户需要手动打开下拉框
  ↓
在列表中找到并点击 DOGE
```

### 改进后 ✅
```
用户点击 DOGE 的 Alert 按钮
  ↓
弹出表单
  ↓
标题显示: "Create Price Alert for DOGE" ✓
当前价格: "$0.172" ✓
Cryptocurrency 下拉框: "DOGE Dogecoin $0.172" ✓ (已自动选中)
  ↓
用户直接配置其他参数，无需重复选择货币
```

## 技术实现

### 1. AlertForm 组件更新

**新增参数**:
```typescript
interface AlertFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultCryptoId?: number; // 新增：默认选中的货币 ID
}
```

**初始化默认值**:
```typescript
const [formData, setFormData] = useState({
  crypto_id: defaultCryptoId ? defaultCryptoId.toString() : '',
  // ... 其他字段
});
```

**监听 defaultCryptoId 变化**:
```typescript
useEffect(() => {
  if (defaultCryptoId) {
    setFormData(prev => ({
      ...prev,
      crypto_id: defaultCryptoId.toString()
    }));
  }
}, [defaultCryptoId]);
```

### 2. QuickAlertButton 组件更新

**传递 defaultCryptoId**:
```tsx
<AlertForm
  onSuccess={handleSuccess}
  onCancel={handleCancel}
  defaultCryptoId={cmcId}  // 传递货币 ID
/>
```

## 用户体验提升

### 优势
1. ✅ **减少操作步骤**: 不需要重复选择已经明确的货币
2. ✅ **避免选错**: 防止用户选择错误的货币
3. ✅ **更加流畅**: 操作流程更加连贯
4. ✅ **符合预期**: 用户点击哪个货币，表单就选中哪个

### 适用场景
- 从主页货币列表点击 Alert 按钮
- 从市场概览（Top Gainers/Losers/Trending）点击 Alert 按钮
- 任何明确知道要为哪个货币创建 Alert 的场景

### 保持兼容
- 如果不传 `defaultCryptoId`，表单仍然显示 "Select a cryptocurrency"
- Profile 页面的 "New Alert" 按钮不传该参数，保持原有行为
- 向后兼容，不影响现有功能

## 修改的文件

1. `components/alerts/alert-form.tsx`
   - 添加 `defaultCryptoId` 参数
   - 初始化时设置默认值
   - 监听参数变化并更新表单

2. `components/alerts/quick-alert-button.tsx`
   - 传递 `cmcId` 作为 `defaultCryptoId`

## 测试验证

### 测试步骤
1. 打开主页
2. 找到任意货币（如 BTC）
3. 点击该货币行的 🔔 Alert 按钮
4. 验证弹出表单中 Cryptocurrency 下拉框已自动选中 BTC
5. 关闭弹窗
6. 点击另一个货币（如 ETH）的 Alert 按钮
7. 验证表单中自动选中 ETH

### 预期结果
- ✅ Cryptocurrency 下拉框显示已选中的货币
- ✅ 显示格式: "符号 名称 价格"（如 "BTC Bitcoin $103,510.017"）
- ✅ 用户可以直接配置其他参数
- ✅ 用户也可以手动更改货币选择

## 总结

这个改进让快速创建 Alert 的功能更加"快速"：
- 用户明确点击了某个货币的 Alert 按钮
- 系统智能识别用户意图
- 自动预填货币选择
- 用户只需关注提醒条件的配置

这是一个细节优化，但能显著提升用户体验和操作效率。
