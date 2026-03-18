---
name: "git-commit-conventions"
description: "Enforces Conventional Commit-like messages and generates templates. Invoke when setting up git hooks, CI commit checks, or when commit messages fail validation."
---

# Git Commit Conventions

## What This Adds

- `commit-msg` hook: blocks commits when message does not match the required regex
- `pre-commit` hook: ensures `commit-msg` hook is installed and prints a suggested template
- Template generator CLI: infers `type`/`scope` from staged files and prints a standard message
- CI check (GitHub Actions): fails PR/push when any commit message in range is non-compliant

## Required Format

`type(scope): subject`

- `type`: one of `feat|fix|refactor|docs|style|test|chore`
- `scope`: `[a-z0-9-]+`
- `subject`: length 1–50

Regex:

`^(feat|fix|refactor|docs|style|test|chore)\([a-z0-9-]+\):\s.{1,50}$`

## Install Locally

- `npm run hooks:install`

## Generate Template

- `npm run commit:template`
- Non-interactive: `node scripts/git/commit-template.mjs --non-interactive`

## Auto Commit After Task

- Invoke after completing any engineering change that produces a diff.
- Steps:
  - Ensure hooks: `npm run hooks:install`
  - Stage: `git add -A`
  - Generate message: `node scripts/git/commit-template.mjs --non-interactive`
  - Commit: `git commit -m "<message>"`

## CI

- Workflow: `.github/workflows/commit-message.yml`

## Troubleshooting

- If `commit-msg` blocks your commit, re-run template generator and edit the subject.
- If hooks are missing (e.g. after re-clone), run `npm run hooks:install`.
