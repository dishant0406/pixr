# pixr

`pixr` is an installable Gemini image CLI for Node.js. Today it is focused on generation workflows with reusable local defaults. The brand is intentionally broader so the tool can grow into a more agentic image editor later.

The npm package name is `pixr-cli`.
The installed command is `pixr`.

## Features

- installable CLI with `pixr`
- reusable home-directory defaults in `~/.pixr/`
- live Gemini image-model listing
- interactive model picker
- saved default model and output directory
- reference-image discovery from `~/.pixr/assets`
- width and height resizing
- output conversion to `png`, `jpg`, or `webp`
- REPL mode when no prompt is passed
- JSON output for scripting
- fallback to the Gemini Files API when inline refs are too large

## Requirements

- Node.js `>=20.10`
- a Gemini API key in `PIXR_API_KEY`

Legacy env vars still work:

- `NANO_IMAGE_API_KEY`
- `NANO_IMAGE_MODEL`
- `NANO_IMAGE_CLIENT_MODULE`

## Install

Install from npm:

```bash
npm install -g pixr-cli
```

Install from this repo:

```bash
npm install
npm link
```

## Quick Start

Set your API key:

```bash
export PIXR_API_KEY=your_gemini_api_key
```

List image-capable Gemini models:

```bash
pixr models
```

Save your preferred default model:

```bash
pixr model gemini-3.1-flash-image-preview
```

Save a default output directory:

```bash
pixr save-dir --set "~/Pictures/pixr"
```

Generate an image:

```bash
pixr generate "a clean product poster for a white mechanical keyboard"
```

Generate and save into a folder:

```bash
pixr generate --save-to ./renders "a studio portrait of a citrus soda can"
```

Generate with exact output size and format:

```bash
pixr generate -w 1600 -h 840 -f webp --save-to ./renders \
  "a minimal editorial thumbnail about digital creativity"
```

Use the prompt directly without the `generate` subcommand:

```bash
pixr "a retro sci-fi postcard of tokyo in rain"
```

Open the REPL:

```bash
pixr
```

## Commands

Every command supports help:

```bash
pixr --help
pixr help generate
pixr generate --help
pixr models --help
pixr model --help
pixr save-dir --help
pixr config --help
pixr refs --help
```

Main commands:

- `pixr generate [options] <prompt>`
- `pixr models`
- `pixr model [<name>] [--clear-model]`
- `pixr save-dir [<path>] [--set <path>] [--clear-save-dir]`
- `pixr refs`
- `pixr config`

Examples:

```bash
pixr generate --model gemini-2.5-flash-image "a soft editorial portrait"
pixr generate --ref ./extra.png --no-default-refs "a bottle shot with hard rim light"
pixr generate -w 1600 "a wide editorial thumbnail with auto height"
pixr models --json
pixr refs --json
pixr config --json
```

## Development

Run directly from the repo:

```bash
npm run dev -- --help
npm run dev -- models
npm run dev -- generate "a chrome camera on velvet"
npm run dev -- save-dir --set "~/Pictures/pixr"
```

If you want the branded npm script:

```bash
npm run pixr -- models
npm run pixr -- config --json
npm run pixr -- help generate
```

## Defaults

`pixr` automatically uses these files if they exist:

```text
~/.pixr/
├── INSTRUCTION.md
├── STYLE.md
├── assets/
│   ├── ref-1.png
│   └── ref-2.jpg
└── config.json
```

Legacy local setup is still read when present:

- `~/.nano-img/config.json`
- `~/.nano-img/assets/`
- `~/.nano-img/INSTRUCTION.md`
- `~/.nano-image/STYLE.md`

Precedence:

1. CLI flags
2. environment variables
3. saved config
4. auto-discovered home-directory files

## Notes

- `models` only shows image-capable Gemini models.
- `--save-to` and `--output` are identical.
- `-w` alone preserves aspect ratio.
- `-h` alone preserves aspect ratio.
- `-w` and `-h` together force exact final dimensions.
- a text file is saved if Gemini returns text alongside the image.

## Testing

See `TEST.md`.

## License

ISC
