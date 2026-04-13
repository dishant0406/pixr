import { APP_NAME } from "./constants.js";

const SHARED_IMAGE_OPTIONS = `  --profile <name>             Apply a named pixr profile
  --prompt-file <path>         Load extra prompt text from a file
  --dry-run                    Show resolved config without calling Gemini
  -m, --model <name>           Override the Gemini image model
  -o, --output <dir>           Output directory for generated files
  --save-to <dir>              Alias for --output
  -w, --width <px>             Resize output to this width
  -h, --height <px>            Resize output to this height
  -f, --format <type>          Output format: png, jpg, jpeg, webp
  --ref <path>                 Add a reference image (repeatable)
  --instruction-file <path>    Override INSTRUCTION.md
  --style-file <path>          Override STYLE.md
  --prefix <name>              Output filename prefix
  --no-default-refs            Ignore ~/.pixr/assets
  -j, --json                   Print machine-readable JSON
  --help                       Show this help`;

const HELP = {
  global: `${APP_NAME}

Usage:
  ${APP_NAME} [options] <prompt>
  ${APP_NAME} gen [options] <prompt>
  ${APP_NAME} generate [options] <prompt>
  ${APP_NAME} edit [options] <input> <prompt>
  ${APP_NAME} vary [options] <input> [prompt]
  ${APP_NAME} model [<name>] [--clear-model]
  ${APP_NAME} models [--json] [--no-interactive]
  ${APP_NAME} profile [list|show|init] [name]
  ${APP_NAME} save-dir [<path>] [--set <path>] [--clear-save-dir]
  ${APP_NAME} refs [--json]
  ${APP_NAME} config [--json] [--init]
  ${APP_NAME} help [command]

Commands:
  gen            Short alias for generate
  generate       Generate one or more images from a prompt
  edit           Edit an input image with a text instruction
  vary           Create one or more Gemini variations of an input image
  model          Show or save the default model in ~/.pixr/config.json
  models         Interactive model picker or plain model list
  profile        List, inspect, or scaffold profile folders
  save-dir       Show or save the default output directory
  refs           Show detected default reference images
  config         Show resolved config and discovered files
  help           Show help for the CLI or a subcommand

Run \`${APP_NAME} <command> --help\` for command-specific help.`,
  config: `${APP_NAME} config

Usage:
  ${APP_NAME} config [--json] [--help]
  ${APP_NAME} config --init
  ${APP_NAME} config --profile <name>

Shows the resolved runtime config after applying:
  1. CLI flags and requested profile
  2. environment variables
  3. ~/.pixr/config.json
  4. auto-discovered home-directory files

Options:
  -j, --json   Print machine-readable JSON
  --init       Create ~/.pixr scaffold files when missing
  --help       Show this help`,
  edit: `${APP_NAME} edit

Usage:
  ${APP_NAME} edit [options] <input> <prompt>
  ${APP_NAME} edit [options] --input <path> <prompt>

Options:
  -i, --input <path>          Input image to edit
  -n, --count <number>        Generate this many edited variants
${SHARED_IMAGE_OPTIONS}

Behavior:
  Gemini edits the input image using your instruction text.
  Width and height resize the final saved output locally.`,
  generate: `${APP_NAME} generate

Usage:
  ${APP_NAME} generate [options] <prompt>
  ${APP_NAME} [options] <prompt>

Options:
${SHARED_IMAGE_OPTIONS}

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
  ${APP_NAME} model [<name>] [--clear-model] [--json] [--help]

Shows, saves, or clears the default model in ~/.pixr/config.json.`,
  models: `${APP_NAME} models

Usage:
  ${APP_NAME} models [--no-interactive] [--json] [--help]

Behavior:
  In a real terminal this opens an arrow-key picker.
  Press Enter to save the selected model.
  Press q or Esc to cancel without saving.`,
  profile: `${APP_NAME} profile

Usage:
  ${APP_NAME} profile
  ${APP_NAME} profile list|show <name>
  ${APP_NAME} profile init <name> [options]

Options:
  -j, --json                 Print machine-readable JSON
  --save-dir <path>          Save outputDir for this profile
  -m, --model <name>         Save model for this profile
  -f, --format <type>        Save format for this profile
  -w, --width <px>           Save width for this profile
  -h, --height <px>          Save height for this profile
  --prefix <name>            Save filename prefix for this profile
  --prompt-file <path>       Save prompt-file for this profile
  -n, --count <number>       Save default count for this profile
  --default-profile          Make this the default profile
  --no-interactive           Skip the interactive init flow
  --help                     Show this help`,
  refs: `${APP_NAME} refs

Usage:
  ${APP_NAME} refs [--json] [--help]

Shows detected default reference images from ~/.pixr/assets.
If more than three exist, pixr keeps the latest three by modified time.

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
  vary: `${APP_NAME} vary

Usage:
  ${APP_NAME} vary [options] <input> [prompt]
  ${APP_NAME} vary [options] --input <path> [prompt]

Options:
  -i, --input <path>          Input image to vary
  -n, --count <number>        Generate this many variations
${SHARED_IMAGE_OPTIONS}

Behavior:
  Without a prompt, ${APP_NAME} asks Gemini for distinct variations while preserving the main subject.
  --count repeats the variation request and saves each result.`,
};

export function getHelpText(topic = "global") {
  return HELP[normalizeTopic(topic)] || HELP.global;
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

function normalizeTopic(topic) {
  return topic === "gen" ? "generate" : topic;
}
