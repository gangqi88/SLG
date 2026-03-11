---
name: 'frontend-workflow-orchestrator'
description: 'Unified orchestrator for the project workflow, coordinating development, automation, and specialized expert skills. Invoke for project planning, task assignment, CI/CD guidance, and tool selection.'
---

# Unified Project Workflow Orchestrator

This skill acts as the central nervous system for the Web3 SLG project, integrating development workflows, automation standards, and specialized expert skills into a unified scheduling and assignment system.

## 🔄 Core Workflow Cycle

### Phase 1: Planning & Architecture

**Goal**: Define what to build and how.

- **Skills**: `architect`, `web3-slg-project-manager`
- **Actions**:
  - Define feature requirements and scope.
  - Design component hierarchy and data flow.
  - Plan smart contract interactions.

### Phase 2: Task Assignment & Setup

**Goal**: Prepare the environment and assign tools.

- **Skills**: `task-scheduler`
- **Setup Experts**: `vite-expert`, `typescript-expert`, `eslint-expert`, `prettier-expert`
- **Actions**:
  - Initialize project structure.
  - Configure build tools and linting rules.
  - Break down tasks into subtasks.

### Phase 3: Development & Implementation

**Goal**: Write the code using specialized experts.

- **Core Framework**: `react-expert`, `nextjs-expert`
- **UI & Styling**: `chakra-ui-expert`, `emotion-expert`
- **State & Logic**: `redux-toolkit-expert`, `tanstack-query-expert`, `immer-expert`
- **Forms & Routing**: `react-hook-form-expert`, `react-router-expert`
- **Web3 Integration**: `web3-developer`

### Phase 4: Quality Assurance & Testing

**Goal**: Ensure reliability and correctness.

- **Skills**: `cypress-expert`, `game-tester`
- **Actions**:
  - Write unit tests (Vitest/Jest).
  - Write end-to-end tests (Cypress).
  - Perform manual game logic verification.

### Phase 5: Automation & CI/CD (Integrated)

**Goal**: Automate checks and deployment.

- **Source**: Merged from `automation-workflow`.
- **Git Flow**:
  - `main`: Production-ready code.
  - `develop`: Integration branch.
  - `feature/*`: New features (e.g., `feature/hero-system`).
  - `fix/*`: Bug fixes.
- **CI Pipeline**:
  1.  **Lint**: `eslint-expert` (Check code style).
  2.  **Type Check**: `typescript-expert` (Validate types).
  3.  **Test**: Run unit and E2E tests.
  4.  **Build**: `vite-expert` (Production build).
- **Deployment**:
  - Automatic deployment to staging on merge to `develop`.
  - Production release on tag creation.

## 🛠 Skill Assignment Matrix

Use this matrix to determine which skill to invoke for specific tasks:

| Task Category | Primary Skill | Secondary Skill |
| form | | |
| **Project Management** | `web3-slg-project-manager` | `task-scheduler` |
| **Architecture** | `architect` | - |
| **UI Development** | `chakra-ui-expert` | `emotion-expert` |
| **State Management** | `redux-toolkit-expert` | `immer-expert` |
| **Data Fetching** | `tanstack-query-expert` | - |
| **Routing** | `react-router-expert` | - |
| **Forms** | `react-hook-form-expert` | - |
| **Testing** | `cypress-expert` | `game-tester` |
| **Build & Tooling** | `vite-expert` | `eslint-expert`, `prettier-expert` |
| **Web3 / Blockchain** | `web3-developer` | - |

## 🚀 Usage Scenarios

### Scenario A: New Feature Development

1.  **Plan**: Invoke `architect` to design the feature.
2.  **Branch**: Create `feature/<name>` following Git Flow.
3.  **Code**: Invoke specialized experts (e.g., `react-expert`, `redux-toolkit-expert`) to implement.
4.  **Verify**: Invoke `eslint-expert` and `typescript-expert` to check quality.
5.  **Test**: Invoke `cypress-expert` to create tests.
6.  **Commit**: Follow Conventional Commits (e.g., `feat: add hero system`).

### Scenario B: CI/CD Setup

1.  **Config**: Consult `automation-workflow` (integrated here) for pipeline structure.
2.  **Scripting**: Use `vite-expert` to optimize build scripts.
3.  **Quality**: Ensure `eslint-expert` and `prettier-expert` configs are strict.

## 📋 Automation Standards (Legacy `automation-workflow`)

- **Commit Message**: `<type>(<scope>): <description>`
- **Quality Gates**: 0 lint errors, 0 type errors, >70% coverage.
- **Release Strategy**: Semantic Versioning (Major.Minor.Patch).

---

_Unified Skill Version: 2.0.0_
_Integrates: frontend-workflow-orchestrator, automation-workflow_
