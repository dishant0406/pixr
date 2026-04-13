import { APP_NAME } from "./constants.js";

const HELP = {
  global: `${APP_NAME}

Usage:
  ${APP_NAME} [options] <prompt>
  ${APP_NAME} generate [options] <prompt>
  ${APP_NAME} model [<name>] [--clear-model]
  ${APP_NAME} models [--json] [--no-interactive]
  ${APP_NAME} save-dir [<path>] [--set <path>] [--clear-save-dir]
  ${APP_NAME} refs [--json]
  ${APP_NAME} config [--json]
  ${APP_NAME} help [command]
  ${APP_NAME}

Commands:
  generate       Generate one or more images from a prompt
  model          Show or save the default model in ~/.pixr/config.json
  models         Interactive model picker or plain model list
  save-dir       Show or save the default output directory
  refs           Show detected default reference images
  config         Show resolved config and discovered files
  help           Show help for the CLI or a subcommand

Run \`${APP_NAME} <command> --help\` for command-specific help.`,
  config: `${APP_NAME} config

Usage:
  ${APP_NAME} config [--json] [--help]

Shows the resolved runtime config after applying:
  1. CLI flags
  2. environment variables
  3. ~/.pixr/config.json
  4. auto-discovered home-directory files

Options:
  -j, --json   Print machine-readable JSON
  --help       Show this help`,
  generate: `${APP_NAME} generate

Usage:
  ${APP_NAME} generate [options] <prompt>
  ${APP_NAME} [options] <prompt>

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
  --no-default-refs           Ignore ~/.pixr/assets
  -j, --json                  Print machine-readable JSON
  --help                      Show this help

Behavior:
  -w only resizes width and preserves aspect ratio
  -h only resizes height and preserves aspect ratio
  -w and -h together force the exact output size
  --save-to / --output overrides the saved default output dir`,
  help: `${APP_NAME} help

Usage:
  ${APP_NAME} help
  ${APP_NAME} help <command>

Examples:
  ${APP_NAME} help generate
  ${APP_NAME} help models`,
  model: `${APP_NAME} model

Usage:
  ${APP_NAME} model
  ${APP_NAME} model <name>
  ${APP_NAME} model --clear-model
  ${APP_NAME} model --json
  ${APP_NAME} model --help

Shows, saves, or clears the default model in ~/.pixr/config.json.`,
  models: `${APP_NAME} models

Usage:
  ${APP_NAME} models
  ${APP_NAME} models --no-interactive
  ${APP_NAME} models --json
  ${APP_NAME} models --help

Behavior:
  In a real terminal this opens an arrow-key picker.
  Press Enter to save the selected model.
  Press q or Esc to cancel without saving.`,
  refs: `${APP_NAME} refs

Usage:
  ${APP_NAME} refs [--json] [--help]

Shows the default reference images detected from ~/.pixr/assets.

Options:
  -j, --json   Print machine-readable JSON
  --help       Show this help`,
  "save-dir": `${APP_NAME} save-dir

Usage:
  ${APP_NAME} save-dir
  ${APP_NAME} save-dir --set <path>
  ${APP_NAME} save-dir <path>
  ${APP_NAME} save-dir --clear-save-dir
  ${APP_NAME} save-dir --json
  ${APP_NAME} save-dir --help

Shows, saves, or clears the default output directory in ~/.pixr/config.json.
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
