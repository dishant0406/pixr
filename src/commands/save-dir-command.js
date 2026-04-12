import { mkdir } from "node:fs/promises";

import { loadRuntimeConfig, resolveUserPath } from "../core/load-runtime-config.js";
import { clearUserConfigKey, getUserConfigPath, writeUserConfig } from "../core/user-config.js";

export async function runSaveDirCommand(targetPath, options) {
  if (options.clearSaveDir) {
    const cleared = await clearUserConfigKey("outputDir");
    const payload = {
      cleared: true,
      configPath: cleared.path,
      outputDir: null,
    };
    print(payload, options.json);
    return payload;
  }

  const nextPath = options.setPath || targetPath;
  if (nextPath) {
    const resolvedPath = resolveUserPath(process.cwd(), nextPath);
    await mkdir(resolvedPath, { recursive: true });
    const saved = await writeUserConfig({ outputDir: resolvedPath });
    const payload = {
      configPath: saved.path,
      outputDir: resolvedPath,
      saved: true,
    };
    print(payload, options.json);
    return payload;
  }

  const runtimeConfig = await loadRuntimeConfig(options);
  const payload = {
    configPath: getUserConfigPath(),
    outputDir: runtimeConfig.outputDir,
    persisted: runtimeConfig.persistedOutputDir ?? null,
  };
  print(payload, options.json);
  return payload;
}

function print(payload, asJson) {
  if (asJson) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  if (payload.saved) {
    console.log(`saved default output dir: ${payload.outputDir}`);
    console.log(`config: ${payload.configPath}`);
    return;
  }
  if (payload.cleared) {
    console.log(`cleared saved output dir in ${payload.configPath}`);
    return;
  }

  console.log(`current output dir: ${payload.outputDir}`);
  if (payload.persisted) {
    console.log(`saved default output dir: ${payload.persisted}`);
  }
  console.log(`config: ${payload.configPath}`);
}
