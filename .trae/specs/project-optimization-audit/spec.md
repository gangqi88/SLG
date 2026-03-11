# Project Optimization Audit Spec

## Why
The current project architecture relies on manual state management (Singleton Managers) and conditional rendering for routing. This approach is difficult to scale, hard to debug, and lacks standard tooling for a modern complex SLG web application. To ensure long-term maintainability, performance, and user experience, a comprehensive audit and refactoring is required.

## What Changes

### 1. Architecture Audit & Refactor
- **Refactor Directory Structure**: Adopt Feature-Sliced Design (FSD) principles or a simplified feature-based structure (e.g., `src/features/auth`, `src/features/city`).
- **Dependency Management**: Analyze `package.json` and remove unused dependencies.
- **Build Optimization**: Configure Vite for better chunk splitting and asset optimization.

### 2. UI/UX Evaluation & Optimization
- **Component Library**: Introduce **Storybook** for component development and documentation.
- **Accessibility**: Enforce WCAG 2.1 AA standards using `eslint-plugin-jsx-a11y` and manual audit.
- **Responsive Design**: Ensure desktop-first design (1024px+) is consistent.

### 3. Style System Optimization
- **CSS-in-JS Adoption**: Migrate from CSS Modules to **Emotion** (or maintain CSS Modules but strictly typed) to support dynamic theming.
- **Design Tokens**: Define global design tokens (colors, typography, spacing) in a centralized config.
- **Linting**: Add `stylelint` for CSS/SCSS.

### 4. Routing Governance
- **React Router**: Replace `useState` based view switching with `react-router-dom` v6/v7.
- **Code Splitting**: Implement `React.lazy` and `Suspense` for route-level code splitting.

### 5. State Management Refactoring
- **Redux Toolkit**: Replace custom Singleton Managers with **Redux Toolkit** (Slices, Thunks).
- **DevTools**: Enable Redux DevTools for state observability.
- **Persistence**: Implement `redux-persist` for critical game state.

### 6. Deliverables & Verification
- **Testing**: Expand `vitest` coverage to >90%. Add **Cypress** for E2E testing.
- **Performance**: Configure Lighthouse CI to ensure Performance/Accessibility/Best Practices > 90.
- **Monitoring**: Setup basic error boundary and logging structure.

## Impact
- **Affected Specs**: All existing feature specs (Alliance, City, Battle) will need to be updated to use new State/Router patterns.
- **Affected Code**: `src/App.tsx`, `src/game/logic/*`, `src/hooks/*`, `src/components/*`.
- **Breaking Changes**:
  - `Manager` classes will be deprecated/removed in favor of Redux Slices.
  - `view` state in App.tsx will be removed.
  - CSS Module imports may change if migrating to Emotion.

## ADDED Requirements
### Requirement: Routing
The system SHALL use `react-router-dom` for navigation, supporting browser history and deep linking.

### Requirement: State Management
The system SHALL use Redux Toolkit for global game state (Resources, Heroes, Alliance).

### Requirement: Component Documentation
The system SHALL have a Storybook instance documenting all core UI components.

## MODIFIED Requirements
### Requirement: Game Logic
**Old**: Game logic resides in Singleton Managers.
**New**: Game logic resides in Redux Thunks/Slices or pure functions called by Thunks.

## REMOVED Requirements
### Requirement: Manual View Switching
**Reason**: Replaced by React Router.
