# Game Modes Implementation Spec

## Why

Implementation of core game modes (Development & Siege) as defined in `GAME_MODES.md` to establish the "Three-Stage Experience Rocket" for player retention and engagement.

## What Changes

- Implement Development Mode (养成模式) features:
  - Side-scrolling resource gathering ("割草").
  - Loot box system ("开箱子").
  - Hero development UI & logic (Star rating, Talents, Equipment).
  - Combo Skills ("合体技") logic.
  - Auto-battle "Brawl" mode ("乱斗演武").
  - Action Tower Defense mini-game ("守卫二乔").
  - Social Cooking mini-game ("厨王争霸").
- Implement Siege Mode (攻城模式) features:
  - Declaration & Siege time window logic.
  - "Sneak Attack" mini-game ("找不同").
  - "Demolition Squad" mini-game ("跑酷").
  - Siege battle phases (Wall Breaker -> Street Fight).
  - Automated defense system.
  - Reward distribution system.

## Impact

- **Affected Specs**: None (New implementation).
- **Affected Code**:
  - `src/game/scenes/`: New scenes for mini-games and battle modes.
  - `src/game/logic/`: New logic for combo skills, siege mechanics, and resource management.
  - `src/components/`: New UI components for hero management, loot boxes, and mini-games.
  - `src/data/`: Updates to hero data structure for combo skills.

## ADDED Requirements

### Requirement: Development Mode - Early Stage (Level 1-20)

The system SHALL provide a side-scrolling view for resource gathering.

- **Scenario: Resource Gathering**
  - **WHEN** player interacts with resource nodes (grass/trees)
  - **THEN** hero performs "cutting" animation and resources are added.
  - **THEN** chance to drop Loot Boxes.

The system SHALL provide a Loot Box system.

- **Scenario: Opening Loot Box**
  - **WHEN** player opens a box
  - **THEN** display opening animation and grant random rewards (Hero fragments, materials, etc.).

### Requirement: Development Mode - Mid Stage (Level 20+)

The system SHALL provide a Hero Development system.

- **Scenario: Hero Upgrade**
  - **WHEN** player uses materials
  - **THEN** hero stats increase.

The system SHALL provide Combo Skills logic.

- **Scenario: Combo Activation**
  - **WHEN** specific heroes are in the same team
  - **THEN** activate unique combo skill effects.

The system SHALL provide a "Brawl" auto-battle mode.

- **Scenario: Brawl Battle**
  - **WHEN** battle starts
  - **THEN** units fight automatically in real-time without turn-based constraints.

### Requirement: Development Mode - Late Stage (Endgame)

The system SHALL provide "Guard the Qiao Sisters" (Action Tower Defense).

- **Scenario: Manual Defense**
  - **WHEN** player enters mode
  - **THEN** player manually controls hero movement and skills to defend against waves.

The system SHALL provide "Chef Contest" (Social Cooking).

- **Scenario: Cooperative Cooking**
  - **WHEN** player invites friends
  - **THEN** players cooperate to complete cooking tasks.

### Requirement: Siege Mode

The system SHALL restrict Siege actions to specific time windows.

- **Scenario: Declaration**
  - **WHEN** time is 12:00-13:00
  - **THEN** alliance leaders can declare war.

The system SHALL provide Siege Stratagem Mini-games.

- **Scenario: Sneak Attack**
  - **WHEN** player starts Sneak Attack
  - **THEN** launch "Find the Difference" game; success damages enemy garrison.
- **Scenario: Demolition Squad**
  - **WHEN** player starts Demolition
  - **THEN** launch "Parkour" game; success reduces wall durability.

The system SHALL implement Siege Battle Phases.

- **Scenario: Wall Breaker Phase**
  - **WHEN** wall durability > 0
  - **THEN** focus on siege engines and Demon units damaging the wall.
- **Scenario: Street Fight Phase**
  - **WHEN** wall durability == 0
  - **THEN** units engage in direct combat; attackers can plunder resources.

## MODIFIED Requirements

None. This is a new feature set implementation.

## REMOVED Requirements

None.
