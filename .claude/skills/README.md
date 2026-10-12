# Claude Code skill guidance

The repository's canonical reusable skill files are in [`../.agents/skills/`](../../.agents/skills/). This folder intentionally contains no copied or symlinked skills. Do not duplicate or synchronize the skill trees as part of bootstrap.

This repository does not claim that Claude Code automatically discovers skills stored in `.agents/skills/`. Read a skill by its repository path when the task calls for it, or add Claude-specific skill files only when explicitly requested and verified against the intended Claude Code version.
