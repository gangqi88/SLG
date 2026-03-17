# 质量门说明

## 目的

本文档用于明确当前项目的质量检查命令、判定标准，以及经实际执行确认的仓库状态。

## 推荐检查命令

### ESLint

```bash
npm run lint
```

### TypeScript 类型检查

```bash
npx tsc --noEmit
```

### 单元测试

```bash
npx vitest run
```

### 生产构建

```bash
npm run build
```

### Stylelint

```bash
npm run lint:style
```

## 当前已验证状态

以下结论基于实际执行结果：

- `npm run build`：通过
- `npx vitest run`：通过
- `npm run lint`：失败
- `npx tsc --noEmit`：失败
- `npm run lint:style`：失败

## 如何解释当前状态

当前仓库并不是“全绿质量状态”，而是：

- 功能原型可运行
- 生产构建可成功
- 已配置并运行单元测试
- 但 lint / typecheck / stylelint 仍有待收敛

因此，任何项目文档都不应再写成“当前 ESLint / TypeScript 全部通过”，除非重新验证并更新本文档。

## 维护建议

- 变更主流程代码后，至少执行：
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npx vitest run`
- 发布前建议补充：
  - `npm run build`
  - `npm run test:e2e`

## 已知事项

- `lint:style` 当前会扫描到 `dist/` 产物，后续建议确认是否应将其排除在源码质量门之外
- 测试通过不代表类型检查通过，二者需要分别验证