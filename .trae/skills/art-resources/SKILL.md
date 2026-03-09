# 美术资源规范技能

> 本技能定义Web3 SLG游戏项目的美术资源生成、管理、命名和质量规范。

## 技能概述

- **职责**: 美术资源管理 - 资源生成、资产管理、质量把控
- **适用场景**: 游戏美术资源的设计、制作、导入和管理
- **技术栈**: React 19 + TypeScript 5.7 + Phaser 3.90

## 技能职责

### 核心职责

美术资源技能负责以下工作：

- 制定美术资源规范和标准
- 管理游戏视觉资源的生成和导入
- 确保美术资源符合项目风格和质量要求
- 协调美术资源与开发、测试的协作
- 优化美术资源性能和加载

### 职责边界

| 包含 | 不包含 |
|------|--------|
| 美术资源规范制定 | 美术设计制作（外部团队） |
| 资源导入和配置 | 代码编写 |
| 资源质量检查 | 测试用例编写 |
| 资源性能优化 | 系统架构设计 |

## 资源分类规范

### 游戏资源类型

游戏美术资源分为以下类别：

| 资源类型 | 说明 | 格式要求 |
|----------|------|----------|
| 角色立绘 | 英雄角色外观展示 | PNG、PSD |
| 场景图片 | 游戏背景、地图元素 | PNG、WebP |
| UI素材 | 按钮、图标、面板 | PNG、SVG |
| 特效动画 | 技能特效、战斗特效 | PNG序列、WebP |
| 图标资源 | 技能图标、道具图标 | PNG、SVG |
| 音效资源 | 背景音乐、音效 | MP3、OGG |
| 字体资源 | 游戏字体 | TTF、WOFF2 |

### 资源优先级

| 优先级 | 资源类型 | 说明 |
|--------|----------|------|
| P0 | 核心角色立绘 | 30名英雄完整立绘 |
| P1 | 战斗特效 | 技能释放、伤害反馈 |
| P2 | UI界面 | 主界面、背包、商店 |
| P3 | 场景装饰 | 背景、粒子效果 |

## 资源命名规范

### 命名原则

- 使用英文命名
- 采用小写字母加下划线
- 名称具有描述性
- 避免使用数字开头
- 最大长度不超过50个字符

### 命名格式

#### 角色资源

```
# 格式
[类型]_[阵营]_[英雄名]_[状态].[格式]

# 示例
sprite_human_sumo_idle.png      # 人族苏墨待机
sprite_angel_luxi_attack.png  # 天使洛曦攻击
sprite_demon_molok_skill.png  # 恶魔摩洛克技能
```

#### UI资源

```
# 格式
ui_[界面]_[元素名]_[状态].[格式]

# 示例
ui_main_button_start.png       # 主界面开始按钮
ui_hero_card_frame.png        # 英雄卡片边框
ui_battle_icon_sword.png      # 战斗图标-剑
```

#### 特效资源

```
# 格式
fx_[效果类型]_[层级].[格式]

# 示例
fx_fire_explosion_01.png      # 火焰爆炸序列1
fx_heal_glow_loop.webp        # 治疗光环循环
```

### 资源目录结构

```
assets/
├── characters/
│   ├── human/           # 人族角色
│   │   ├── sumo/       # 苏墨
│   │   │   ├── idle.png
│   │   │   ├── attack.png
│   │   │   └── skill.png
│   │   └── ...
│   ├── angel/          # 天使角色
│   └── demon/          # 恶魔角色
├── ui/
│   ├── buttons/
│   ├── icons/
│   └── panels/
├── effects/
│   ├── battle/
│   └── ui/
├── backgrounds/
│   ├── scenes/
│   └── maps/
└── audio/
    ├── music/
    └── sfx/
```

## 资源质量标准

### 图片资源标准

| 标准项 | 要求 |
|--------|------|
| 分辨率 | 偶数像素，推荐512x512、1024x1024 |
| 背景 | 透明或指定背景色 |
| 文件大小 | 单图不超过2MB |
| 色彩模式 | RGB 8bit |
| 格式 | PNG（透明）、WebP（动画） |

### 动画资源标准

| 标准项 | 要求 |
|--------|------|
| 帧率 | 30fps或60fps |
| 循环 | 需要循环的动画必须首尾平滑过渡 |
| 序列帧 | 使用Sprite Sheet合并 |
| 播放时长 | 单次特效不超过3秒 |

### 音频资源标准

| 标准项 | 要求 |
|--------|------|
| 采样率 | 44100Hz |
| 位深 | 16bit |
| 格式 | MP3（背景音乐）、OGG（音效） |
| 时长 | 背景音乐不超过3分钟 |
| 文件大小 | 单个音效不超过500KB |

## 资源导入规范

### 导入流程

```
资源准备 → 命名检查 → 质量检查 → 格式转换 → 导入项目 → 配置文件 → 验证测试
```

### 导入检查清单

- [ ] 文件命名符合规范
- [ ] 资源尺寸符合标准
- [ ] 透明通道正确
- [ ] 无压缩错误
- [ ] 资源已添加到版本控制
- [ ] 已在配置文件中注册

### 资源配置

资源导入后需要在配置文件中注册：

```typescript
// resources/character-config.ts
export const characterResources = {
  sumo: {
    name: '苏墨',
    faction: 'human',
    quality: 'orange',
    sprites: {
      idle: 'assets/characters/human/sumo/idle.png',
      attack: 'assets/characters/human/sumo/attack.png',
      skill: 'assets/characters/human/sumo/skill.png',
    },
    animations: {
      idle: { frames: 4, fps: 6 },
      attack: { frames: 8, fps: 12 },
    },
  },
} as const;
```

## 资源性能优化

### 图片优化

- 使用Sprite Sheet合并小图
- 使用WebP格式替代PNG（支持时）
- 压缩透明背景图片
- 移除不必要的元数据

### 加载优化

```typescript
// 资源预加载示例
class ResourceLoader {
  async preload() {
    const scene = this.scene;
    
    // 按优先级分组加载
    await this.loadCriticalResources();  // P0 核心资源
    await this.loadBattleResources();     // P1 战斗资源  
    await this.loadUIResources();         // P2 UI资源
    await this.loadDecorationResources();  // P3 装饰资源
  }
  
  private async loadCriticalResources() {
    const criticalAssets = [
      'characters/human/sumo/idle.png',
      'characters/angel/luxi/idle.png',
      'characters/demon/molok/idle.png',
    ];
    await Promise.all(
      criticalAssets.map(path => this.loadImage(path))
    );
  }
}
```

### 内存管理

- 及时释放不使用的资源
- 使用对象池复用动画对象
- 监控内存使用情况
- 定期清理缓存

## 资源版本管理

### 版本控制原则

- 所有美术资源必须纳入版本控制
- 使用Git LFS管理大文件
- 定期提交资源更新
- 保持提交信息清晰

### 分支策略

```
main:       # 生产环境资源
develop:    # 开发中资源
feature/*:  # 功能相关资源
```

### 更新流程

1. 在feature分支进行资源修改
2. 更新资源配置文件
3. 提交Pull Request
4. 代码审查确认
5. 合并到develop/main

## 与其他技能的协作

### 与代码规范技能协作

资源技能与代码规范技能的协作：

```markdown
协作点：
- 资源配置需要符合代码规范
- 资源加载使用统一的资源管理类
- 资源路径使用项目定义的别名

引用：fullstack-code-standards/SKILL.md
```

### 与测试规范技能协作

资源技能与测试规范的协作：

```markdown
协作点：
- 资源加载失败需要正确处理
- 资源缺失需要显示占位图
- 资源加载过程需要进度显示

引用：game-tester/SKILL.md
```

### 与自动化工作流技能协作

资源技能与自动化工作流的协作：

```markdown
协作点：
- 资源构建脚本自动化
- 资源压缩优化集成到CI
- 资源版本自动标记

引用：automation-workflow/SKILL.md
```

## 常用工具

### 资源处理工具

| 工具 | 用途 |
|------|------|
| Photoshop | 图片编辑、导出 |
| Aseprite | 像素画、动画 |
| TexturePacker | Sprite Sheet打包 |
| Toptal Compressor | 图片压缩 |
| FFMPEG | 音频格式转换 |
| SVGOMG | SVG优化 |

### 资源检查命令

```bash
# 检查图片尺寸
identify image.png

# 批量压缩PNG
find assets -name "*.png" -exec optipng {} \;

# 检查损坏的图片
find assets -name "*.png" -exec file {} \; | grep -v PNG
```

## 常见问题处理

### 问题：资源加载失败

解决方案：
1. 检查文件路径是否正确
2. 检查文件是否损坏
3. 检查浏览器控制台错误信息
4. 验证资源是否在配置文件中注册

### 问题：内存占用过高

解决方案：
1. 使用Sprite Sheet合并小图
2. 降低图片分辨率
3. 启用资源懒加载
4. 定期清理未使用资源

### 问题：动画不流畅

解决方案：
1. 检查帧率设置
2. 优化Sprite Sheet尺寸
3. 减少同屏动画数量
4. 使用GPU加速渲染

---

*技能版本: 1.0.0*
*创建日期: 2026-03-06*
*相关文档: 
  - fullstack-code-standards/SKILL.md
  - game-tester/SKILL.md
  - automation-workflow/SKILL.md*
*遵守规范: .trae/rules/project-rules/SKILL.md*
