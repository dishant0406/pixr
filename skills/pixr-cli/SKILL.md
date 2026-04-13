---
name: pixr-cli
description: Drives the local pixr Gemini image CLI for image generation, model selection, saved defaults, reference-image workflows, and output sizing or format conversion. Use when the user wants to generate images with pixr, inspect config or refs, set the default model or save directory, manage ~/.pixr files, or get command-specific help for this CLI.
metadata:
  author: pixr
  version: 0.1.0
---

# Pixr CLI

## When To Use

Use this skill when the task is specifically about the local `pixr` CLI in this repository or its home-directory defaults under `~/.pixr`.

Typical triggers:

- "generate an image with pixr"
- "set the pixr model"
- "save images to a default folder"
- "use the refs from ~/.pixr/assets"
- "show what pixr supports"
- "fix or inspect pixr config"

Do not use this skill for general Gemini API design discussions that are not tied to this CLI.

## Execution Mode

Prefer the installed binary when available:

- `pixr`

If you are working inside this repo and do not want to depend on a global link, use:

- `npm run dev -- <command>`
- `npm run pixr -- <command>`

## Core Workflow

1. Start by checking the exact command surface instead of assuming flags.
   Use `pixr help` for global help or `pixr <command> --help` for command help.
2. If the task is generation, inspect saved defaults first when they matter.
   Run `pixr config --json`.
3. If the task depends on a saved model or output directory, prefer the dedicated commands over editing config by hand:
   - `pixr model ...`
   - `pixr save-dir ...`
4. If the task depends on reusable prompts or style, use the home-directory files:
   - `~/.pixr/INSTRUCTION.md`
   - `~/.pixr/STYLE.md`
   - `~/.nano-image/STYLE.md`
5. If the task uses default reference images, inspect `~/.pixr/assets` and verify with `pixr refs --json`.
6. After changing behavior, validate with one concrete CLI command and capture the resulting output path or config state.

## Generate Images

For generation details and command recipes, read `references/command-reference.md`.

Key rules:

- Use `generate` explicitly unless the user clearly wants the shorthand prompt form.
- Respect saved defaults from `~/.pixr/config.json`.
- If the user passes `--save-to` or `--output`, that overrides the saved default output directory.
- Width-only or height-only requests preserve aspect ratio during local resize.
- Width plus height forces the final image to the exact requested dimensions.
- Format defaults to `png`; `jpg`, `jpeg`, and `webp` are supported through local conversion.

## Configure Defaults

For persistent settings and file layout, read `references/defaults-and-files.md`.

Prefer command-driven config changes:

- Save model: `pixr model <name>`
- Pick model interactively: `pixr models`
- Save default output dir: `pixr save-dir --set "<path>"`
- Clear saved output dir: `pixr save-dir --clear-save-dir`

Avoid editing `~/.pixr/config.json` directly unless the user explicitly asks for a manual file edit.

## Troubleshooting

Read `references/troubleshooting.md` when:

- generation fails
- models do not list
- the picker or config looks wrong
- output paths or refs are not being used

## Validation

After making changes or guiding usage:

- run one obvious command that should succeed
- use `--json` when you need machine-readable confirmation
- report the exact saved model, output directory, or generated file path when relevant
