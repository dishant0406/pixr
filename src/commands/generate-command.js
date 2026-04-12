import { readFile } from "node:fs/promises";

import { generateImages } from "../core/generate-images.js";
import { loadRuntimeConfig } from "../core/load-runtime-config.js";

export async function runGenerateCommand(prompt, options) {
  const finalPrompt = prompt || (await readPromptFromStdin());
  if (!finalPrompt) {
    throw new Error("Provide a prompt, or pipe one into stdin.");
  }

  const runtimeConfig = await loadRuntimeConfig(options);
  const result = await generateImages(finalPrompt, runtimeConfig);

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return result;
  }

  for (const warning of result.warnings) {
    console.error(`warning: ${warning}`);
  }

  console.log(`model: ${result.model}`);
  console.log(`reference mode: ${result.referenceMode}`);
  if (result.references.length) {
    console.log(`references: ${result.references.length}`);
  }
  for (const image of result.images) {
    console.log(`saved image: ${image}`);
  }
  if (result.textPath) {
    console.log(`saved text: ${result.textPath}`);
  }
  return result;
}

async function readPromptFromStdin() {
  if (process.stdin.isTTY) {
    return "";
  }
  return (await readFile(process.stdin.fd, "utf8")).trim();
}
