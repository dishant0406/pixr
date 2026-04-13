# Defaults And Files

## Home Directory Layout

```text
~/.pixr/
├── INSTRUCTION.md
├── STYLE.md
├── assets/
│   └── ...
└── config.json
```

Legacy paths still read when present:

```text
~/.nano-img/
~/.nano-image/STYLE.md
```

## File Roles

- `INSTRUCTION.md`: persistent non-style guidance
- `STYLE.md`: persistent style guidance
- `assets/`: default reference images used unless `--no-default-refs` is passed
- `config.json`: saved defaults for model and output directory

Example:

```json
{
  "model": "gemini-3.1-flash-image-preview",
  "outputDir": "/absolute/path/to/renders"
}
```

## Preferred Commands

- model: `pixr model <name>`
- output dir: `pixr save-dir --set "<path>"`

## Inspect

```bash
pixr config --json
pixr refs --json
find ~/.pixr -maxdepth 2 -type f | sort
```

## Notes

- `save-dir --set "~/Pictures/pixr"` expands `~` to the current user's home directory
- `--save-to` and `--output` are aliases
