# Fix EventBus Missing Spec

> **当前归类**: 已完成整改记录  
> **使用边界**: 用于回溯一次缺失模块修复过程，不作为当前架构说明或长期模块设计文档。  
> **现行真源**: 实际代码、`docs/architecture/overview.md`

## Why

The project fails to build because `src/game/EventBus.ts` is missing, causing import errors in multiple files like `DemolitionScene.ts`.

## What Changes

- Create `src/game/EventBus.ts` with a standard `Phaser.Events.EventEmitter` instance.

## Impact

- **Affected Specs**: None.
- **Affected Code**:
  - `src/game/EventBus.ts` (New file)
  - `src/game/scenes/DemolitionScene.ts` (Fixes import resolution)

## ADDED Requirements

### Requirement: EventBus Module

The system SHALL provide an EventBus module at `src/game/EventBus.ts`.

#### Scenario: Import Resolution

- **WHEN** other modules import `EventBus` from `src/game/EventBus`
- **THEN** the import resolves correctly and provides an event emitter instance.
