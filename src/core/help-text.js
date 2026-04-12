const HELP = {
  global: `nano-img

Usage:
  nano-img [options] <prompt>
  nano-img generate [options] <prompt>
  nano-img model [<name>] [--clear-model]
  nano-img models [--json] [--no-interactive]
  nano-img save-dir [<path>] [--set <path>] [--clear-save-dir]
  nano-img refs [--json]
  nano-img config [--json]
  nano-img help [command]
  nano-img

Commands:
  generate       Generate one or more images from a prompt
  model          Show or save the default model in ~/.nano-img/config.json
  models         Interactive model picker or plain model list
  save-dir       Show or save the default output directory
  refs           Show detected default reference images
  config         Show resolved config and discovered files
  help           Show help for the CLI or a subcommand

Run \`nano-img <command> --help\` for command-specific help.`,
  config: `nano-img config

Usage:
  nano-img config [--json] [--help]

Shows the resolved runtime config after applying:
  1. CLI flags
  2. environment variables
  3. ~/.nano-img/config.json
  4. auto-discovered home-directory files

Options:
  -j, --json   Print machine-readable JSON
  --help       Show this help`,
  generate: `nano-img generate

Usage:
  nano-img generate [options] <prompt>
  nano-img [options] <prompt>

Options:
  -m, --model <name>          Override the Gemini image model
  -o, --output <dir>          Output directory for generated files
  --save-to <dir>             Alias for --output
  -w, --width <px>            Resize output to this width
  -h, --height <px>           Resize output to this height
  -f, --format <type>         Output format: png, jpg, jpeg, webp
  --ref <path>                Add a reference image (repeatable)
  --instruction-file <path>   Override INSTRUCTION.md
  --style-file <path>         Override STYLE.md
  --prefix <name>             Output filename prefix
  --no-default-refs           Ignore ~/.nano-img/assets
  -j, --json                  Print machine-readable JSON
  --help                      Show this help

Behavior:
  -w only resizes width and preserves aspect ratio
  -h only resizes height and preserves aspect ratio
  -w and -h together force the exact output size
  --save-to / --output overrides the saved default output dir`,
  help: `nano-img help

Usage:
  nano-img help
  nano-img help <command>

Examples:
  nano-img help generate
  nano-img help models`,
  model: `nano-img model

Usage:
  nano-img model
  nano-img model <name>
  nano-img model --clear-model
  nano-img model --json
  nano-img model --help

Shows, saves, or clears the default model in ~/.nano-img/config.json.`,
  models: `nano-img models

Usage:
  nano-img models
  nano-img models --no-interactive
  nano-img models --json
  nano-img models --help

Behavior:
  In a real terminal this opens an arrow-key picker.
  Press Enter to save the selected model.
  Press q or Esc to cancel without saving.`,
  refs: `nano-img refs

Usage:
  nano-img refs [--json] [--help]

Shows the default reference images detected from ~/.nano-img/assets.

Options:
  -j, --json   Print machine-readable JSON
  --help       Show this help`,
  "save-dir": `nano-img save-dir

Usage:
  nano-img save-dir
  nano-img save-dir --set <path>
  nano-img save-dir <path>
  nano-img save-dir --clear-save-dir
  nano-img save-dir --json
  nano-img save-dir --help

Shows, saves, or clears the default output directory in ~/.nano-img/config.json.
Passed --save-to / --output always takes precedence over the saved default.`,
};

export function getHelpText(topic = "global") {
  return HELP[topic] || HELP.global;
}

export function getReplHelpText() {
  return `REPL commands:
  /help
  /config
  /refs
  /model <name>
  /output <path>
  /default-refs on|off
  /quit`;
}
