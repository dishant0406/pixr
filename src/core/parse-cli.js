import { parseArgs } from "node:util";

const COMMANDS = new Set(["config", "generate", "help", "model", "models", "refs", "save-dir"]);

const options = {
  help: { type: "boolean" },
  "clear-save-dir": { type: "boolean" },
  format: { short: "f", type: "string" },
  height: { short: "h", type: "string" },
  json: { short: "j", type: "boolean" },
  model: { short: "m", type: "string" },
  output: { short: "o", type: "string" },
  prefix: { type: "string" },
  ref: { multiple: true, type: "string" },
  "instruction-file": { type: "string" },
  "style-file": { type: "string" },
  "no-default-refs": { type: "boolean" },
  "clear-model": { type: "boolean" },
  "no-interactive": { type: "boolean" },
  "save-to": { type: "string" },
  set: { type: "string" },
  width: { short: "w", type: "string" },
};

export function parseCli(argv) {
  const command = COMMANDS.has(argv[0]) ? argv[0] : argv.length === 0 ? "repl" : "generate";
  const args = command === "generate" && !COMMANDS.has(argv[0]) ? argv : argv.slice(1);
  const parsed = parseArgs({
    allowPositionals: true,
    args,
    options,
    strict: true,
  });

  if (command === "help") {
    return {
      command: "help",
      topic: parsed.positionals[0] || "global",
    };
  }

  if (parsed.values.help) {
    return { command: "help", topic: command };
  }

  return {
    command,
    options: {
      instructionFile: parsed.values["instruction-file"],
      clearModel: Boolean(parsed.values["clear-model"]),
      clearSaveDir: Boolean(parsed.values["clear-save-dir"]),
      format: parsed.values.format,
      height: parsed.values.height,
      json: Boolean(parsed.values.json),
      model: parsed.values.model,
      noDefaultRefs: Boolean(parsed.values["no-default-refs"]),
      noInteractive: Boolean(parsed.values["no-interactive"]),
      output: parsed.values.output || parsed.values["save-to"],
      prefix: parsed.values.prefix,
      refs: parsed.values.ref ?? [],
      setPath: parsed.values.set,
      styleFile: parsed.values["style-file"],
      width: parsed.values.width,
    },
    prompt: parsed.positionals.join(" ").trim(),
    topic: command,
  };
}
