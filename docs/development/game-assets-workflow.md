# 游戏素材接入工作流

本文档定义当前仓库的游戏素材接入规范，目标是让美术交付、前端接入、构建校验和运行回退形成统一流程。

## 适用范围

- 素材发布目录：`public/game-assets/`
- 素材清单真源：`src/shared/config/assets/manifests/*.json`
- 素材类型导出：`src/shared/config/assets/index.ts`
- 场景预加载入口：`src/shared/scenes/PreloadScene.ts`

## 目录规范

- 发布素材统一放到 `public/game-assets/`
- 推荐按 `feature/type` 分层目录，例如 `public/game-assets/background/`
- 业务代码中不直接硬编码素材 URL，统一由清单驱动

## 命名规范

- 文件名格式：`<feature>_<category>_<name>_<variant>`
- 只允许小写字母、数字、下划线
- 禁止空格与中文文件名
- 素材 key 需与文件语义一致

## 清单字段规范

`manifests` 目录下每个 JSON 条目必须包含：

- `key`: 全局唯一素材标识
- `url`: 以 `/` 开头的公开访问路径
- `type`: `image` 或 `audio`
- `feature`: 所属玩法或模块标识
- `optional`: 是否为可选素材

## 接入步骤

1. 接收美术素材并按命名规范整理文件名。
2. 将素材放入 `public/game-assets/` 对应目录。
3. 在对应分组清单中新增素材条目（如 `background.json`、`character.json`、`ui-audio.json`）。
4. 运行 `npm run assets:check` 校验清单与文件一致性。
5. 运行 `npm run dev`，验证目标场景是否正常加载素材。
6. 若素材属于可选项，断开文件验证回退逻辑仍可进入场景。

## 加载与回退策略

- 预加载阶段先加载必需素材，再加载可选素材。
- 可按 `assetFeatures` 对清单进行分组过滤加载。
- 未传 `assetFeatures` 时按 `targetScene` 自动回退到预设分组。
- 必需素材缺失：开发环境输出完整错误，生产环境保留关键错误信号。
- 可选素材缺失：允许回退并继续进入目标场景。
- 背景图缺失时，系统使用运行时生成纹理作为兜底。

## 场景分组实践

- 各页面在写入 `startData` 时传 `assetFeatures`。
- 推荐通过 `src/shared/config/assets/sceneAssetFeatures.ts` 统一维护映射。
- 例如：`CityScene -> ['shared-background', 'ui']`，`BattleScene -> ['shared-background', 'hero', 'ui']`。
- 战斗页支持 `?mode=pvp|pve|siege`，并映射到 `battle-pvp / battle-pve / battle-siege` 分组。

## 提交前检查

- 必跑命令：`npm run assets:check`
- 涉及场景加载逻辑变更时，补跑：`npm run build`
- 提交说明需写明实际执行过的检查项和结果

## 常见问题排查

- `assets:check` 报文件不存在：确认 `url` 与 `public/game-assets/` 相对路径一致。
- `assets:check` 报重复 key：为冲突条目重命名并同步更新引用方。
- 场景显示默认背景：检查对应素材是否在清单中且 `url` 可访问。
- 本地可见生产不可见：检查是否误用绝对文件系统路径而非站点根路径。
