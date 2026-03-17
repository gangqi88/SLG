# Game Modes Implementation Checklist

> **当前归类**: 已完成实现过程文档  
> **使用边界**: 本清单用于回溯当次玩法实现验收，不应直接视为当前所有模式仍处于完全通过状态。  
> **现行真源**: 实际代码、`docs/architecture/overview.md`

## Development Mode (养成模式)

- [x] **Task 1: Resource Gathering**
  - [x] Player can control hero movement in side-scrolling view.
  - [x] Resources (grass/trees) can be destroyed ("cut").
  - [x] Correct resource types (Wood/Food/Stone) are added to inventory.
  - [x] Loot boxes drop with specified probability.

- [x] **Task 2: Loot Box System**
  - [x] Loot boxes appear in inventory.
  - [x] Opening animation plays correctly.
  - [x] Rewards are granted based on box rarity (Green/Blue/Purple/Red).
  - [x] Inventory updates correctly after opening.

- [x] **Task 3: Hero Development**
  - [x] Hero stats update correctly upon leveling up.
  - [x] Equipment slots unlock at specific levels.
  - [x] Star rating increases stats by specified percentage.
  - [x] Materials are consumed correctly.

- [x] **Task 4: Combo Skills**
  - [x] Combo skills activate when correct heroes are in the team.
  - [x] Visual indicator shows active combos.
  - [x] Combo effects (buffs/damage) are applied in battle simulation.

- [x] **Task 5: Brawl Battle**
  - [x] Units move and attack automatically.
  - [x] Skills are cast without manual input (unless toggled).
  - [x] Damage numbers and effects display correctly.
  - [x] Battle ends when one side is defeated.

- [x] **Task 6: Guard the Qiao Sisters**
  - [x] Player can manually control hero movement.
  - [x] Enemies spawn in waves and attack the target (Qiao Sisters).
  - [x] Game over condition (Target HP = 0) triggers correctly.

- [x] **Task 7: Chef Contest**
  - [x] Ingredients can be combined to create dishes.
  - [x] "Invite Friend" button simulates adding a player.
  - [x] Score updates based on successful dishes.

## Siege Mode (攻城模式)

- [x] **Task 8: Siege Rules**
  - [x] Declaration button is only active during 12:00-13:00.
  - [x] Siege actions are restricted to declared targets.
  - [x] Attack button is only active during 20:00-21:00 (Siege Time).

- [x] **Task 9: Sneak Attack Mini-game**
  - [x] "Find the Difference" game launches correctly.
  - [x] Finding differences within time limit deals damage to garrison.
  - [x] Failure results in no damage.

- [x] **Task 10: Demolition Squad Mini-game**
  - [x] "Parkour" game launches correctly.
  - [x] Player can dodge falling obstacles.
  - [x] Survival time correlates to Wall Durability damage.
  - [x] Wall HP reduces correctly in the main Siege view.

- [x] **Task 11: Siege Battle Phases**
  - [x] Battle starts in Wall Breaker phase.
  - [x] Siege engines deal bonus damage to walls.
  - [x] Phase transitions to Street Fight when Wall HP = 0.
  - [x] Attackers can loot resources in Street Fight phase.

- [x] **Task 12: Defense & Rewards**
  - [x] Garrison units automatically engage attackers.
  - [x] Victory screen displays correct rewards.
  - [x] Alliance points/funds update after successful siege.
