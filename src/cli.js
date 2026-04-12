#!/usr/bin/env node

import { runConfigCommand } from "./commands/config-command.js";
import { runGenerateCommand } from "./commands/generate-command.js";
import { runModelCommand } from "./commands/model-command.js";
import { runModelsCommand } from "./commands/models-command.js";
import { runRefsCommand } from "./commands/refs-command.js";
import { runSaveDirCommand } from "./commands/save-dir-command.js";
import { getHelpText } from "./core/help-text.js";
import { parseCli } from "./core/parse-cli.js";
import { startRepl } from "./repl/start-repl.js";

try {
  const parsed = parseCli(process.argv.slice(2));

  if (parsed.command === "help") {
    console.log(getHelpText(parsed.topic));
  } else if (parsed.command === "config") {
    await runConfigCommand(parsed.options);
  } else if (parsed.command === "model") {
    await runModelCommand(parsed.prompt, parsed.options);
  } else if (parsed.command === "models") {
    await runModelsCommand(parsed.options);
  } else if (parsed.command === "save-dir") {
    await runSaveDirCommand(parsed.prompt, parsed.options);
  } else if (parsed.command === "refs") {
    await runRefsCommand(parsed.options);
  } else if (parsed.command === "repl") {
    await startRepl(parsed.options);
  } else {
    await runGenerateCommand(parsed.prompt, parsed.options);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
