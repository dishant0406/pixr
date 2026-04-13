export function buildRuntimePreview({ operation, prompt, runtimeConfig }) {
  return {
    operation,
    model: runtimeConfig.model,
    profile: runtimeConfig.profile,
    profileSource: runtimeConfig.profileSource,
    prompt,
    promptFilePath: runtimeConfig.promptFilePath,
    outputDir: runtimeConfig.outputDir,
    prefix: runtimeConfig.prefix,
    format: runtimeConfig.format,
    width: runtimeConfig.width ?? null,
    height: runtimeConfig.height ?? null,
    count: runtimeConfig.count,
    instructionPath: runtimeConfig.instructionPath,
    stylePath: runtimeConfig.stylePath,
    input: runtimeConfig.inputFile?.path || null,
    references: runtimeConfig.referenceFiles.map((file) => file.path),
    warnings: runtimeConfig.warnings,
  };
}

export function printRuntimePreview(preview, asJson) {
  if (asJson) {
    console.log(JSON.stringify(preview, null, 2));
    return;
  }

  console.log(`operation: ${preview.operation}`);
  if (preview.profile) {
    console.log(`profile: ${preview.profile} (${preview.profileSource || "resolved"})`);
  }
  console.log(`model: ${preview.model}`);
  console.log(`output: ${preview.outputDir}`);
  console.log(`prefix: ${preview.prefix}`);
  console.log(`format: ${preview.format}`);
  console.log(`width: ${preview.width ?? "auto"}`);
  console.log(`height: ${preview.height ?? "auto"}`);
  console.log(`count: ${preview.count}`);
  if (preview.input) {
    console.log(`input: ${preview.input}`);
  }
  console.log(`instruction: ${preview.instructionPath}`);
  console.log(`style: ${preview.stylePath}`);
  console.log(`prompt file: ${preview.promptFilePath}`);
  console.log(`references: ${preview.references.length}`);
  for (const warning of preview.warnings) {
    console.log(`warning: ${warning}`);
  }
  console.log(`prompt: ${preview.prompt}`);
}
