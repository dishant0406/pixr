import readline from "node:readline/promises";

import { runConfigCommand } from "../commands/config-command.js";
import { runGenerateCommand } from "../commands/generate-command.js";
import { runRefsCommand } from "../commands/refs-command.js";
import { getReplHelpText } from "../core/help-text.js";

export async function startRepl(baseOptions) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const session = {
    ...baseOptions,
    refs: [...(baseOptions.refs ?? [])],
  };

  console.log("nano-img REPL");
  console.log("Type /help for commands.");

  while (true) {
    const line = (await rl.question("nano-img> ")).trim();
    if (!line) {
      continue;
    }
    if (line === "/quit" || line === "/exit") {
      break;
    }
    if (line === "/help") {
      console.log(getReplHelpText());
      continue;
    }
    if (line === "/config") {
      await runConfigCommand(session);
      continue;
    }
    if (line === "/refs") {
      await runRefsCommand(session);
      continue;
    }
    if (line.startsWith("/model ")) {
      session.model = line.slice(7).trim();
      console.log(`model set to ${session.model}`);
      continue;
    }
    if (line.startsWith("/output ")) {
      session.output = line.slice(8).trim();
      console.log(`output set to ${session.output}`);
      continue;
    }
    if (line === "/default-refs on") {
      session.noDefaultRefs = false;
      console.log("default references enabled");
      continue;
    }
    if (line === "/default-refs off") {
      session.noDefaultRefs = true;
      console.log("default references disabled");
      continue;
    }

    try {
      await runGenerateCommand(line, session);
    } catch (error) {
      console.error(error.message);
    }
  }

  rl.close();
}
