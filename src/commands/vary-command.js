import { editImages } from "../core/edit-images.js";
import { loadRuntimeConfig } from "../core/load-runtime-config.js";
import { readPromptFromStdin } from "../core/read-prompt-from-stdin.js";
import { buildRuntimePreview, printRuntimePreview } from "../core/runtime-preview.js";
import { buildPrompt } from "../core/runtime-defaults.js";

export async function runVaryCommand(prompt, options) {
  const runtimeConfig = await loadRuntimeConfig({
    ...options,
    commandName: "vary",
  });
  const stdinPrompt = prompt || (await readPromptFromStdin());
  const finalPrompt = buildPrompt({
    commandName: "vary",
    fallbackPrompt:
      "Create a distinct variation of this image. Preserve the main subject and overall style while exploring new framing, details, and composition.",
    prompt: stdinPrompt,
    promptTemplate: runtimeConfig.promptTemplate,
  });

  if (options.dryRun) {
    const preview = buildRuntimePreview({
      operation: "vary",
      prompt: finalPrompt,
      runtimeConfig,
    });
    printRuntimePreview(preview, options.json);
    return preview;
  }

  const result = await editImages(finalPrompt, runtimeConfig, {
    count: runtimeConfig.count,
    mode: "vary",
  });

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return result;
  }

  printResult(result);
  return result;
}

function printResult(result) {
  for (const warning of result.warnings) {
    console.error(`warning: ${warning}`);
  }

  console.log(`operation: ${result.operation}`);
  console.log(`model: ${result.model}`);
  console.log(`input: ${result.input}`);
  console.log(`reference mode: ${result.referenceMode}`);
  if (result.references.length) {
    console.log(`references: ${result.references.length}`);
  }
  for (const image of result.images) {
    console.log(`saved image: ${image}`);
  }
  for (const textPath of result.textPaths) {
    console.log(`saved text: ${textPath}`);
  }
}
