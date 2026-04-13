# Command Reference

## Identity

- npm package name: `pixr`
- installed binary: `pixr`

## Help

- `pixr help`
- `pixr help generate`
- `pixr generate --help`
- `pixr models --help`
- `pixr save-dir --help`

## Generate

Use for one-shot image creation:

```bash
pixr generate "a minimal editorial thumbnail"
pixr generate --save-to ./renders "a product poster"
pixr generate -w 1600 -h 840 -f webp "a dark blog hero"
pixr generate --ref ./extra.png --no-default-refs "a controlled studio shot"
```

## Models

```bash
pixr models
pixr models --no-interactive
pixr models --json
pixr model
pixr model gemini-3.1-flash-image-preview
pixr model --clear-model
```

Notes:

- In a TTY, `pixr models` opens an arrow-key picker.
- The chosen model is saved to config on Enter.

## Output Directory

```bash
pixr save-dir
pixr save-dir --set "~/Pictures/pixr"
pixr save-dir /absolute/or/relative/path
pixr save-dir --clear-save-dir
```

Resolution order:

1. explicit `--save-to` or `--output`
2. saved `outputDir` in `~/.pixr/config.json`
3. current working directory

## Inspect

```bash
pixr config --json
pixr refs --json
```
