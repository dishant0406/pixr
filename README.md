# nano-img

`nano-img` is a reusable Gemini image-generation CLI for Node.js. It is designed for a local "Nano Banana" style workflow where prompts, style guidance, and reference images can live in your home directory and get applied automatically on every run.

It uses the official Gemini JS SDK and does not call Gemini app Gems directly. Instead, it recreates that behavior with:

- `~/.nano-img/assets/` for reusable reference images
- `~/.nano-img/INSTRUCTION.md` for persistent instruction text
- `~/.nano-img/STYLE.md` or `~/.nano-image/STYLE.md` for style guidance
- `~/.nano-img/config.json` for saved defaults like the selected model

## Features

- Installable CLI with `nano-img`
- Dev runner with `npm run dev -- ...`
- Live image-model listing from the Gemini API
- Arrow-key model picker in the terminal
- Saved default model in `~/.nano-img/config.json`
- Optional output folder via `--save-to` or `--output`
- Persisted default output directory command
- Width/height resize flags with local exact resizing
- Output format conversion with `png`, `jpg`, or `webp`
- Auto-discovered reference images from `~/.nano-img/assets`
- REPL mode when no prompt is passed
- JSON output for scripting
- Automatic fallback to the Gemini Files API when inline references are too large

## Requirements

- Node.js `>=20.10`
- A Gemini API key in `NANO_IMAGE_API_KEY`

## Install

Install dependencies:

```bash
npm install
```

Install the CLI into your shell:

```bash
npm link
```

After that you can run:

```bash
nano-img --help
nano-img generate --help
nano-img models --help
nano-img save-dir --help
```

## Development Usage

Run the CLI directly from the repo without linking:

```bash
npm run dev -- --help
npm run dev -- models
npm run dev -- generate "a chrome camera on velvet"
npm run dev -- generate -w 1600 -h 840 -f webp "a chrome camera on velvet"
npm run dev -- save-dir --set "~/nano-image"
```

If you want the command name inside npm scripts:

```bash
npm run nano-img -- models
npm run nano-img -- config --json
npm run nano-img -- generate --save-to ./renders "a dramatic tea tin packshot"
npm run nano-img -- help generate
```

## Quick Start

Set your API key:

```bash
export NANO_IMAGE_API_KEY=your_gemini_api_key
```

List image-capable Gemini models:

```bash
nano-img models
```

Save your preferred default model:

```bash
nano-img model gemini-3.1-flash-image-preview
```

Interactive picker:

```bash
nano-img models
```

Use the arrow keys, then press Enter. That saves the selected model into `~/.nano-img/config.json`.

Save a default output directory:

```bash
nano-img save-dir --set "~/nano-image"
```

Show the saved output directory:

```bash
nano-img save-dir
```

Plain non-interactive list:

```bash
nano-img models --no-interactive
nano-img models --json
```

That writes:

```json
{
  "model": "gemini-3.1-flash-image-preview"
}
```

to `~/.nano-img/config.json`.

Generate an image:

```bash
nano-img generate "a clean product poster for a white mechanical keyboard"
```

Generate and save into a folder:

```bash
nano-img generate --save-to ./renders "a studio portrait of a citrus soda can"
```

Generate with exact output size and format:

```bash
nano-img generate -w 1600 -h 840 -f webp --save-to ./renders \
  "a minimal dark editorial blog thumbnail about digital creativity"
```

Use the prompt directly without the `generate` subcommand:

```bash
nano-img "a retro sci-fi postcard of tokyo in rain"
```

Open the REPL:

```bash
nano-img
```

Every command supports its own help screen:

```bash
nano-img --help
nano-img help generate
nano-img generate --help
nano-img models --help
nano-img model --help
nano-img save-dir --help
nano-img config --help
nano-img refs --help
```

## Commands

### `generate`

Generate one or more images from a prompt.

Examples:

```bash
nano-img generate "a silver watch on obsidian"
nano-img generate --model gemini-2.5-flash-image "a soft editorial portrait"
nano-img generate --save-to ./out --prefix campaign "a sneaker floating in mist"
nano-img generate --ref ./extra.png --no-default-refs "a bottle shot with hard rim light"
nano-img generate -w 1600 -h 840 -f webp "a minimal flat-vector creative-tech hero"
nano-img generate -w 1600 "a wide editorial thumbnail with auto height"
```

### `models`

List available image-capable models from the Gemini API. In a real terminal, this opens an arrow-key picker and saves your selection when you press Enter.

```bash
nano-img models
nano-img models --no-interactive
nano-img models --json
```

### `model`

Show, save, or clear the default model without interaction.

```bash
nano-img model
nano-img model gemini-3.1-flash-image-preview
nano-img model --clear-model
```

### `refs`

Show detected reference images.

```bash
nano-img refs
nano-img refs --json
```

### `config`

Show resolved config after applying flags, environment variables, saved config, and auto-discovered files.

```bash
nano-img config
nano-img config --json
```

### `save-dir`

Show, save, or clear the default output directory. This value is stored in `~/.nano-img/config.json` and used unless `--save-to` or `--output` is passed during generation.

```bash
nano-img save-dir
nano-img save-dir --set "~/nano-image"
nano-img save-dir /absolute/or/relative/path
nano-img save-dir --clear-save-dir
```

## CLI Options

```text
-m, --model <name>             Override the Gemini image model
-o, --output <dir>             Output directory for generated files
--save-to <dir>                Alias for --output
-w, --width <px>               Resize output to this width
-h, --height <px>              Resize output to this height
-f, --format <type>            Output format: png, jpg, jpeg, webp
--ref <path>                   Add a reference image (repeatable)
--instruction-file <path>      Override INSTRUCTION.md
--style-file <path>            Override STYLE.md
--prefix <name>                Output filename prefix
--no-default-refs              Ignore ~/.nano-img/assets
--clear-model                  Clear the saved default model
--set <path>                   Setter for commands like save-dir
--clear-save-dir               Clear the saved default output directory
--no-interactive               Disable the arrow-key picker
-j, --json                     Print machine-readable JSON
--help                         Show help
```

## Home Directory Files

`nano-img` automatically uses these files if they exist:

```text
~/.nano-img/
├── assets/
│   ├── ref-1.png
│   └── ref-2.jpg
├── INSTRUCTION.md
├── STYLE.md
└── config.json
```

Fallback style file:

```text
~/.nano-image/STYLE.md
```

## Config Resolution Order

1. CLI flags
2. Environment variables
3. `~/.nano-img/config.json`
4. Auto-discovered files under `~/.nano-img`

Environment variables:

- `NANO_IMAGE_API_KEY`
- `NANO_IMAGE_MODEL`
- `NANO_IMAGE_CLIENT_MODULE`

## REPL Commands

```text
/help
/config
/refs
/model <name>
/output <path>
/default-refs on|off
/quit
```

## Output Behavior

- Images are written to the current directory by default.
- `--save-to` and `--output` both change the target folder.
- `nano-img save-dir --set "<path>"` stores the default output directory in config.
- A passed `--save-to` or `--output` always takes precedence over the saved default.
- Default output format is `png`.
- `-w` alone preserves the generated image aspect ratio while resizing to the requested width.
- `-h` alone preserves the generated image aspect ratio while resizing to the requested height.
- Passing both `-w` and `-h` forces that exact output size.
- A text file is also saved if Gemini returns text alongside the image.
- Reference images are sent inline when possible.
- If the request would be too large, the CLI uploads references through the Gemini Files API automatically.

## Testing

Run tests:

```bash
npm test
```

Validate the CLI locally:

```bash
npm run dev -- --help
npm run dev -- models
npm run dev -- models --no-interactive
npm link
nano-img --help
```
