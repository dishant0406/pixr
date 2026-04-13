import { loadRuntimeConfig } from "../core/load-runtime-config.js";
import { initPixrHome } from "../core/pixr-home.js";

export async function runConfigCommand(options) {
  const initState = options.init ? await initPixrHome() : null;
  const runtimeConfig = await loadRuntimeConfig({
    ...options,
    commandName: "generate",
  });
  const payload = {
    configPath: runtimeConfig.configPath,
    count: runtimeConfig.count,
    format: runtimeConfig.format,
    hasApiKey: runtimeConfig.hasApiKey,
    height: runtimeConfig.height ?? null,
    init: initState,
    instructionPath: runtimeConfig.instructionPath,
    model: runtimeConfig.model,
    outputDir: runtimeConfig.outputDir,
    persistedModel: runtimeConfig.persistedModel,
    persistedOutputDir: runtimeConfig.persistedOutputDir,
    prefix: runtimeConfig.prefix,
    profile: runtimeConfig.profile,
    profileSource: runtimeConfig.profileSource,
    promptFilePath: runtimeConfig.promptFilePath,
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
  if (payload.profile) {
    console.log(`profile: ${payload.profile} (${payload.profileSource || "resolved"})`);
  }
  if (payload.init) {
    console.log(`initialized: ${payload.init.configDir}`);
    console.log(`created: ${payload.init.created.length}`);
  }
  console.log(`api key loaded: ${payload.hasApiKey ? "yes" : "no"}`);
  console.log(`config: ${payload.configPath}`);
  console.log(`instruction: ${payload.instructionPath}`);
  console.log(`style: ${payload.stylePath}`);
  console.log(`prompt file: ${payload.promptFilePath}`);
  console.log(`references: ${payload.references.length}`);
  console.log(`output: ${payload.outputDir}`);
  console.log(`count: ${payload.count}`);
  console.log(`width: ${payload.width ?? "auto"}`);
  console.log(`height: ${payload.height ?? "auto"}`);
  console.log(`format: ${payload.format}`);
  return payload;
}
