import { parseArgs } from "node:util";

const COMMANDS = new Set(["config", "edit", "gen", "generate", "help", "model", "models", "profile", "refs", "save-dir", "vary"]);

const options = {
  count: { short: "n", type: "string" },
  "dry-run": { type: "boolean" },
  "default-profile": { type: "boolean" },
  help: { type: "boolean" },
  init: { type: "boolean" },
  "clear-save-dir": { type: "boolean" },
  format: { short: "f", type: "string" },
  height: { short: "h", type: "string" },
  input: { short: "i", type: "string" },
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
  profile: { type: "string" },
  "prompt-file": { type: "string" },
  "save-dir": { type: "string" },
  "save-to": { type: "string" },
  set: { type: "string" },
  width: { short: "w", type: "string" },
};

export function parseCli(argv) {
  const rawCommand = COMMANDS.has(argv[0]) ? argv[0] : argv.length === 0 ? "repl" : "generate";
  const command = rawCommand === "gen" ? "generate" : rawCommand;
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

  if (command === "profile") {
    const profileState = parseProfilePositionals(parsed.positionals);
    return {
      command,
      options: {
        defaultProfile: Boolean(parsed.values["default-profile"]),
        init: Boolean(parsed.values.init),
        json: Boolean(parsed.values.json),
        count: parsed.values.count,
        format: parsed.values.format,
        height: parsed.values.height,
        model: parsed.values.model,
        noInteractive: Boolean(parsed.values["no-interactive"]),
        output: parsed.values["save-dir"] || parsed.values.output || parsed.values["save-to"],
        prefix: parsed.values.prefix,
        profileAction: profileState.action,
        profileTarget: profileState.name,
        promptFile: parsed.values["prompt-file"],
        width: parsed.values.width,
      },
      prompt: "",
      topic: command,
    };
  }

  const { input, prompt } = parsePositionals(command, parsed.positionals, parsed.values.input);

  return {
    command,
    options: {
      instructionFile: parsed.values["instruction-file"],
      clearModel: Boolean(parsed.values["clear-model"]),
      clearSaveDir: Boolean(parsed.values["clear-save-dir"]),
      count: parsed.values.count,
      dryRun: Boolean(parsed.values["dry-run"]),
      format: parsed.values.format,
      height: parsed.values.height,
      init: Boolean(parsed.values.init),
      input,
      json: Boolean(parsed.values.json),
      model: parsed.values.model,
      noDefaultRefs: Boolean(parsed.values["no-default-refs"]),
      noInteractive: Boolean(parsed.values["no-interactive"]),
      output: parsed.values["save-dir"] || parsed.values.output || parsed.values["save-to"],
      profile: parsed.values.profile,
      prefix: parsed.values.prefix,
      promptFile: parsed.values["prompt-file"],
      refs: parsed.values.ref ?? [],
      setPath: parsed.values.set,
      styleFile: parsed.values["style-file"],
      width: parsed.values.width,
    },
    prompt,
    topic: command,
  };
}

function parseProfilePositionals(positionals) {
  if (positionals.length === 0) {
    return { action: "list", name: null };
  }

  const [first, second] = positionals;
  if (first === "list" || first === "show" || first === "init") {
    return {
      action: first,
      name: second || null,
    };
  }

  return {
    action: "show",
    name: first,
  };
}

function parsePositionals(command, positionals, inputOption) {
  if (command !== "edit" && command !== "vary") {
    return {
      input: inputOption,
      prompt: positionals.join(" ").trim(),
    };
  }

  if (inputOption) {
    return {
      input: inputOption,
      prompt: positionals.join(" ").trim(),
    };
  }

  return {
    input: positionals[0],
    prompt: positionals.slice(1).join(" ").trim(),
  };
}
