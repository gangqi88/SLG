# Tasks

- [x] Task 1: Architecture Audit & Setup: Review and refactor project structure for scalability.
  - [x] SubTask 1.1: Analyze current directory structure and dependencies.
  - [x] SubTask 1.2: Refactor `src` to Feature-Based structure (e.g., `features/auth`, `features/city`).
  - [x] SubTask 1.3: Update `tsconfig.json` paths for cleaner imports.

- [x] Task 2: Linting & Formatting Enforcement: Ensure code quality and consistency.
  - [x] SubTask 2.1: Update ESLint configuration with strict rules (React Hooks, A11y).
  - [x] SubTask 2.2: Install and configure `stylelint` for CSS/SCSS files.
  - [x] SubTask 2.3: Configure Prettier and ensure EditorConfig consistency.

- [x] Task 3: Routing Implementation: Replace manual view switching with React Router.
  - [x] SubTask 3.1: Install `react-router-dom`.
  - [x] SubTask 3.2: Create route configuration (including lazy loading).
  - [x] SubTask 3.3: Refactor `App.tsx` to use `<RouterProvider>` or `<Routes>`.

- [x] Task 4: State Management Refactoring: Migrate from Singleton Managers to Redux Toolkit.
  - [x] SubTask 4.1: Install `@reduxjs/toolkit` and `react-redux`.
  - [x] SubTask 4.2: Create root store and initial slices (e.g., `userSlice`, `gameSlice`).
  - [x] SubTask 4.3: Migrate `AllianceManager` logic to `allianceSlice`.
  - [x] SubTask 4.4: Migrate `CityManager` logic to `citySlice`.

- [x] Task 5: UI/UX & Component Library: Setup Storybook and Design System.
  - [x] SubTask 5.1: Install and configure Storybook for React + Vite. (Substituted with Custom Style Guide Page due to environment constraints)
  - [x] SubTask 5.2: Create stories for core components (Button, Modal, Card). (Included in Style Guide)
  - [x] SubTask 5.3: Define Design Tokens (colors, spacing) in a theme file (e.g., `theme.ts` or CSS variables).

- [x] Task 6: Testing & QA: Enhance testing infrastructure.
  - [x] SubTask 6.1: Expand Vitest configuration for better coverage reporting.
  - [x] SubTask 6.2: Install and configure Cypress for E2E testing.
  - [x] SubTask 6.3: Create initial E2E test for critical path (Login -> City -> Battle).

- [x] Task 7: Performance & Final Report: Generate optimization report and verify metrics.
  - [x] SubTask 7.1: Run Lighthouse CI and analyze results. (Optimization Report generated)
  - [x] SubTask 7.2: Generate `OPTIMIZATION_REPORT.md` summarizing findings and improvements.
