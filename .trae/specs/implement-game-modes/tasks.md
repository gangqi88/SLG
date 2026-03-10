# Implementation Tasks for Game Modes

## Development Mode (养成模式)

- [ ] Task 1: **Implement Early Stage - Side-Scrolling Resource Gathering** ("割草")
  - [ ] SubTask 1.1: Create `GatheringScene` with side-scrolling mechanics.
  - [ ] SubTask 1.2: Implement resource nodes (grass/trees) as destructible objects.
  - [ ] SubTask 1.3: Add hero "attack" animation for gathering.
  - [ ] SubTask 1.4: Implement resource drop logic (Wood/Food/Stone).

- [ ] Task 2: **Implement Early Stage - Loot Box System** ("开箱子")
  - [ ] SubTask 2.1: Create `LootBox` data structure and probability tables.
  - [ ] SubTask 2.2: Implement `LootBoxView` UI component for opening animation.
  - [ ] SubTask 2.3: Integrate loot drops into GatheringScene.
  - [ ] SubTask 2.4: Implement inventory system for storing boxes and rewards.

- [ ] Task 3: **Implement Mid Stage - Hero Development System**
  - [ ] SubTask 3.1: Update `Hero` interface with Star Rating, Talents, and Equipment slots.
  - [ ] SubTask 3.2: Create `HeroDevelopmentView` UI for upgrading/evolving heroes.
  - [ ] SubTask 3.3: Implement logic for material consumption and stat recalculation.

- [ ] Task 4: **Implement Mid Stage - Combo Skills System** ("合体技")
  - [ ] SubTask 4.1: Define Combo Skill data structure and triggers (e.g., specific hero combinations).
  - [ ] SubTask 4.2: Implement logic to check active combos in team formation.
  - [ ] SubTask 4.3: Add visual indicators for active combos in Battle UI.

- [ ] Task 5: **Implement Mid Stage - Brawl Battle Mode** ("乱斗演武")
  - [ ] SubTask 5.1: Create `BrawlScene` with auto-battle logic (no turn-based).
  - [ ] SubTask 5.2: Implement real-time unit movement and skill casting AI.
  - [ ] SubTask 5.3: Add "Chaos" visual effects and damage numbers.

- [ ] Task 6: **Implement Late Stage - "Guard the Qiao Sisters"** (Action Tower Defense)
  - [ ] SubTask 6.1: Create `TowerDefenseScene` with manual hero control.
  - [ ] SubTask 6.2: Implement enemy wave spawning logic.
  - [ ] SubTask 6.3: Add "Qiao Sisters" NPC and health bar (lose condition).

- [ ] Task 7: **Implement Late Stage - "Chef Contest"** (Social Cooking)
  - [ ] SubTask 7.1: Create `CookingScene` with cooperative mini-game mechanics.
  - [ ] SubTask 7.2: Implement simple recipe logic (ingredient combination).
  - [ ] SubTask 7.3: Add "Invite Friend" mock functionality (desktop simulation).

## Siege Mode (攻城模式)

- [ ] Task 8: **Implement Siege Rules & Time Windows**
  - [ ] SubTask 8.1: Implement server time check logic for Declaration (12:00-13:00) and Siege (20:00-21:00).
  - [ ] SubTask 8.2: Create `SiegeDeclarationView` for alliance leaders.
  - [ ] SubTask 8.3: Restrict siege actions outside valid time windows.

- [ ] Task 9: **Implement Stratagem - "Sneak Attack" Mini-game** ("找不同")
  - [ ] SubTask 9.1: Create `SneakAttackScene` with "Find the Difference" mechanics.
  - [ ] SubTask 9.2: Implement success/fail logic and damage calculation to enemy garrison.

- [ ] Task 10: **Implement Stratagem - "Demolition Squad" Mini-game** ("跑酷")
  - [ ] SubTask 10.1: Create `DemolitionScene` with side-scrolling runner mechanics.
  - [ ] SubTask 10.2: Implement obstacle generation (falling rocks) and player movement (dodge).
  - [ ] SubTask 10.3: Calculate wall damage based on survival time.

- [ ] Task 11: **Implement Siege Battle Phases**
  - [ ] SubTask 11.1: Create `SiegeBattleScene` handling Wall Breaker phase (Siege Engines/Demons vs Wall).
  - [ ] SubTask 11.2: Implement transition to Street Fight phase when Wall HP is 0.
  - [ ] SubTask 11.3: Implement plunder logic for attackers in Street Fight phase.

- [ ] Task 12: **Implement Defense & Rewards**
  - [ ] SubTask 12.1: Implement automated defense logic for garrisoned units.
  - [ ] SubTask 12.2: Create `SiegeRewardView` for claiming victory rewards.
  - [ ] SubTask 12.3: Implement Alliance/Season reward calculation logic.

# Task Dependencies
- Task 3 depends on Task 1 (Resources needed for upgrades).
- Task 4 depends on Task 3 (Hero data structure).
- Task 5 depends on Task 4 (Combo skills used in battle).
- Task 11 depends on Task 8 (Siege must be declared).
- Task 9 & 10 are independent mini-games but feed into Task 11 (Weakening defenses).
