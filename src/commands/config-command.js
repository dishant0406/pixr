import { loadRuntimeConfig } from "../core/load-runtime-config.js";

export async function runConfigCommand(options) {
  const runtimeConfig = await loadRuntimeConfig(options);
  const payload = {
    configPath: runtimeConfig.configPath,
    format: runtimeConfig.format,
    hasApiKey: runtimeConfig.hasApiKey,
    height: runtimeConfig.height ?? null,
    instructionPath: runtimeConfig.instructionPath,
    model: runtimeConfig.model,
    outputDir: runtimeConfig.outputDir,
    persistedModel: runtimeConfig.persistedModel,
    persistedOutputDir: runtimeConfig.persistedOutputDir,
    prefix: runtimeConfig.prefix,
    references: runtimeConfig.referenceFiles.map((file) => file.path),
    stylePath: runtimeConfig.stylePath,
    systemInstructionLoaded: Boolean(runtimeConfig.systemInstruction),
    width: runtimeConfig.width ?? null,
    warnings: runtimeConfig.warnings,
  };

  if (options.json) {
    console.log(JSON.stringify(payload, null, 2));
    return payload;
  }

  console.log(`model: ${payload.model}`);
  if (payload.persistedModel) {
    console.log(`saved default model: ${payload.persistedModel}`);
  }
  if (payload.persistedOutputDir) {
    console.log(`saved default output dir: ${payload.persistedOutputDir}`);
  }
  console.log(`api key loaded: ${payload.hasApiKey ? "yes" : "no"}`);
  console.log(`config: ${payload.configPath}`);
  console.log(`instruction: ${payload.instructionPath}`);
  console.log(`style: ${payload.stylePath}`);
  console.log(`references: ${payload.references.length}`);
  console.log(`output: ${payload.outputDir}`);
  console.log(`width: ${payload.width ?? "auto"}`);
  console.log(`height: ${payload.height ?? "auto"}`);
  console.log(`format: ${payload.format}`);
  return payload;
}
