# Fix Build Errors Spec

## Why

The `npm run build` command fails with two errors:

1.  **TypeScript Error**: `src/game/logic/BattleSystem.ts` assigns to a constant variable `maxHp`.
2.  **Import Error**: `src/components/SiegeView.tsx` imports `HUMAN_HEROES` which is not exported by `src/data/humanHeroes.ts`.

## What Changes

- Fix variable assignment in `src/game/logic/BattleSystem.ts`.
- Export `HUMAN_HEROES` (alias for `humanHeroes`) in `src/data/humanHeroes.ts`.

## Impact

- **Affected Specs**: None.
- **Affected Code**:
  - `src/game/logic/BattleSystem.ts`
  - `src/data/humanHeroes.ts`

## ADDED Requirements

### Requirement: Build Success

The system SHALL compile without errors when running `npm run build`.

## MODIFIED Requirements

### Requirement: Battle System Initialization

Initialize units correctly without reassigning constants.

### Requirement: Data Exports

Ensure `humanHeroes` is exported as `HUMAN_HEROES` for consistency or update import.
