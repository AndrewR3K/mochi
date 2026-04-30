# Repository Settings (GitHub)

This document is the recommended baseline for branch protection and pull request flow in `AndrewR3K/mochi`.

## 1) Default branch

- Set default branch to `main`.

## 2) Branch protection rule for `main`

In GitHub settings:

`Settings -> Branches -> Add branch protection rule`

Use:

- **Branch name pattern**: `main`
- **Require a pull request before merging**: enabled
  - Require approvals: `1`
  - Dismiss stale pull request approvals when new commits are pushed: enabled
  - Require review from Code Owners: enabled
- **Require status checks to pass before merging**: enabled
  - Required check: `validate` (from `.github/workflows/ci.yml`)
  - Require branches to be up to date before merging: enabled
- **Require conversation resolution before merging**: enabled
- **Do not allow bypassing the above settings**: enabled (recommended)
- **Restrict who can push to matching branches**: optional (recommended for teams)
- **Allow force pushes**: disabled
- **Allow deletions**: disabled

## 3) Pull request defaults

- PR template is defined at `.github/pull_request_template.md`.
- CODEOWNERS is defined at `.github/CODEOWNERS`.

## 4) GitHub Pages

In GitHub settings:

`Settings -> Pages -> Build and deployment`

Use:

- **Source**: GitHub Actions
- **Workflow**: `.github/workflows/pages.yml`

The docs site is built with `pnpm docs:build` and deployed from `docs/.vitepress/dist`.

## 5) Recommended merge strategy

- Enable **Squash merge**
- Disable **Merge commit** and **Rebase merge** (optional, but keeps history cleaner)

## 6) Suggested branch naming

- `feature/<area>-<short-name>`
- `fix/<area>-<short-name>`
- `docs/<topic>`
- `chore/<topic>`

Example:

- `feature/game-controller-presets`
- `fix/sentry-collision-tunneling`

## 7) Local branch workflow

```bash
git checkout main
git pull
git checkout -b feature/my-change
```

After work:

```bash
git push -u origin feature/my-change
```

Open PR into `main`, wait for `validate`, request review, then merge.
