# Implementation Tasks for Game Modes

> **当前归类**: 已完成实现过程文档  
> **使用边界**: 勾选状态反映当时实现拆解与交付记录，不替代当前功能验收或回归测试结果。  
> **现行真源**: `src/router.tsx`、实际代码

## Development Mode (养成模式)

- [x] Task 1: **Implement Early Stage - Side-Scrolling Resource Gathering** ("割草")
  - [x] SubTask 1.1: Create `GatheringScene` with side-scrolling mechanics.
  - [x] SubTask 1.2: Implement resource nodes (grass/trees) as destructible objects.
  - [x] SubTask 1.3: Add hero "attack" animation for gathering.
  - [x] SubTask 1.4: Implement resource drop logic (Wood/Food/Stone).

- [x] Task 2: **Implement Early Stage - Loot Box System** ("开箱子")
  - [x] SubTask 2.1: Create `LootBox` data structure and probability tables.
  - [x] SubTask 2.2: Implement `LootBoxView` UI component for opening animation.
  - [x] SubTask 2.3: Integrate loot drops into GatheringScene.
  - [x] SubTask 2.4: Implement inventory system for storing boxes and rewards.

- [x] Task 3: **Implement Mid Stage - Hero Development System**
  - [x] SubTask 3.1: Update `Hero` interface with Star Rating, Talents, and Equipment slots.
  - [x] SubTask 3.2: Create `HeroDevelopmentView` UI for upgrading/evolving heroes.
  - [x] SubTask 3.3: Implement logic for material consumption and stat recalculation.

- [x] Task 4: **Implement Mid Stage - Combo Skills System** ("合体技")
  - [x] SubTask 4.1: Define Combo Skill data structure and triggers (e.g., specific hero combinations).
  - [x] SubTask 4.2: Implement logic to check active combos in team formation.
  - [x] SubTask 4.3: Add visual indicators for active combos in Battle UI.

- [x] Task 5: **Implement Mid Stage - Brawl Battle Mode** ("乱斗演武")
  - [x] SubTask 5.1: Create `BrawlScene` with auto-battle logic (no turn-based).
  - [x] SubTask 5.2: Implement real-time unit movement and skill casting AI.
  - [x] SubTask 5.3: Add "Chaos" visual effects and damage numbers.

- [x] Task 6: **Implement Late Stage - "Guard the Qiao Sisters"** (Action Tower Defense)
  - [x] SubTask 6.1: Create `TowerDefenseScene` with manual hero control.
  - [x] SubTask 6.2: Implement enemy wave spawning logic.
  - [x] SubTask 6.3: Add "Qiao Sisters" NPC and health bar (lose condition).

- [x] Task 7: **Implement Late Stage - "Chef Contest"** (Social Cooking)
  - [x] SubTask 7.1: Create `CookingScene` with cooperative mini-game mechanics.
  - [x] SubTask 7.2: Implement simple recipe logic (ingredient combination).
  - [x] SubTask 7.3: Add "Invite Friend" mock functionality (desktop simulation).

## Siege Mode (攻城模式)

- [x] Task 8: **Implement Siege Rules & Time Windows**
  - [x] SubTask 8.1: Implement server time check logic for Declaration (12:00-13:00) and Siege (20:00-21:00).
  - [x] SubTask 8.2: Create `SiegeDeclarationView` for alliance leaders.
  - [x] SubTask 8.3: Restrict siege actions outside valid time windows.

- [x] Task 9: **Implement Stratagem - "Sneak Attack" Mini-game** ("找不同")
  - [x] SubTask 9.1: Create `SneakAttackScene` with "Find the Difference" mechanics.
  - [x] SubTask 9.2: Implement success/fail logic and damage calculation to enemy garrison.

- [x] Task 10: **Implement Stratagem - "Demolition Squad" Mini-game** ("跑酷")
  - [x] SubTask 10.1: Create `DemolitionScene` with side-scrolling runner mechanics.
  - [x] SubTask 10.2: Implement obstacle generation (falling rocks) and player movement (dodge).
  - [x] SubTask 10.3: Calculate wall damage based on survival time.

- [x] Task 11: **Implement Siege Battle Phases**
  - [x] SubTask 11.1: Create `SiegeBattleScene` handling Wall Breaker phase (Siege Engines/Demons vs Wall).
  - [x] SubTask 11.2: Implement transition to Street Fight phase when Wall HP is 0.
  - [x] SubTask 11.3: Implement plunder logic for attackers in Street Fight phase.

- [x] Task 12: **Implement Defense & Rewards**
  - [x] SubTask 12.1: Implement automated defense logic for garrisoned units.
  - [x] SubTask 12.2: Create `SiegeRewardView` for claiming victory rewards.
  - [x] SubTask 12.3: Implement Alliance/Season reward calculation logic.

# Task Dependencies

- Task 3 depends on Task 1 (Resources needed for upgrades).
- Task 4 depends on Task 3 (Hero data structure).
- Task 5 depends on Task 4 (Combo skills used in battle).
- Task 11 depends on Task 8 (Siege must be declared).
- Task 9 & 10 are independent mini-games but feed into Task 11 (Weakening defenses).
