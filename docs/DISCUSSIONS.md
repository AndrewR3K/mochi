# Discussions

Use GitHub Discussions for open-ended Mochi conversations before they become scoped issues.

## Good discussion topics

- API shape and naming
- starter ideas
- game demo pitches
- engine architecture questions
- screenshots or clips from games built with Mochi
- alpha developer-experience feedback that is not yet a specific bug

## Categories to enable

Enable these GitHub Discussion categories in repository settings:

- **Ideas** - early proposals and API sketches
- **Q&A** - setup, usage, and engine questions
- **Show and tell** - demos, clips, experiments, and project updates

The repository includes discussion form templates for those categories under `.github/DISCUSSION_TEMPLATE`.

## Starter post

Use this as the first pinned discussion:

```md
# Welcome to Mochi Discussions

Mochi is a Vue-first web game engine focused on making the first playable scene easy while keeping the runtime and renderer framework-agnostic.

Start here:

- Try the alpha starter: `pnpm dev:starter`
- Read the first-game guide: `docs/FIRST_GAME.md`
- Share friction with the alpha developer experience
- Post demos, questions, API ideas, and starter requests

Current focus: make the alpha release smooth enough that an external developer can build a small playable web game without touching engine internals.
```
