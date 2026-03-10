# Game Modes Implementation Checklist

## Development Mode (养成模式)

- [ ] **Task 1: Resource Gathering**
  - [ ] Player can control hero movement in side-scrolling view.
  - [ ] Resources (grass/trees) can be destroyed ("cut").
  - [ ] Correct resource types (Wood/Food/Stone) are added to inventory.
  - [ ] Loot boxes drop with specified probability.

- [ ] **Task 2: Loot Box System**
  - [ ] Loot boxes appear in inventory.
  - [ ] Opening animation plays correctly.
  - [ ] Rewards are granted based on box rarity (Green/Blue/Purple/Red).
  - [ ] Inventory updates correctly after opening.

- [ ] **Task 3: Hero Development**
  - [ ] Hero stats update correctly upon leveling up.
  - [ ] Equipment slots unlock at specific levels.
  - [ ] Star rating increases stats by specified percentage.
  - [ ] Materials are consumed correctly.

- [ ] **Task 4: Combo Skills**
  - [ ] Combo skills activate when correct heroes are in the team.
  - [ ] Visual indicator shows active combos.
  - [ ] Combo effects (buffs/damage) are applied in battle simulation.

- [ ] **Task 5: Brawl Battle**
  - [ ] Units move and attack automatically.
  - [ ] Skills are cast without manual input (unless toggled).
  - [ ] Damage numbers and effects display correctly.
  - [ ] Battle ends when one side is defeated.

- [ ] **Task 6: Guard the Qiao Sisters**
  - [ ] Player can manually control hero movement.
  - [ ] Enemies spawn in waves and attack the target (Qiao Sisters).
  - [ ] Game over condition (Target HP = 0) triggers correctly.

- [ ] **Task 7: Chef Contest**
  - [ ] Ingredients can be combined to create dishes.
  - [ ] "Invite Friend" button simulates adding a player.
  - [ ] Score updates based on successful dishes.

## Siege Mode (攻城模式)

- [ ] **Task 8: Siege Rules**
  - [ ] Declaration button is only active during 12:00-13:00.
  - [ ] Siege actions are restricted to declared targets.
  - [ ] Attack button is only active during 20:00-21:00 (Siege Time).

- [ ] **Task 9: Sneak Attack Mini-game**
  - [ ] "Find the Difference" game launches correctly.
  - [ ] Finding differences within time limit deals damage to garrison.
  - [ ] Failure results in no damage.

- [ ] **Task 10: Demolition Squad Mini-game**
  - [ ] "Parkour" game launches correctly.
  - [ ] Player can dodge falling obstacles.
  - [ ] Survival time correlates to Wall Durability damage.
  - [ ] Wall HP reduces correctly in the main Siege view.

- [ ] **Task 11: Siege Battle Phases**
  - [ ] Battle starts in Wall Breaker phase.
  - [ ] Siege engines deal bonus damage to walls.
  - [ ] Phase transitions to Street Fight when Wall HP = 0.
  - [ ] Attackers can loot resources in Street Fight phase.

- [ ] **Task 12: Defense & Rewards**
  - [ ] Garrison units automatically engage attackers.
  - [ ] Victory screen displays correct rewards.
  - [ ] Alliance points/funds update after successful siege.
