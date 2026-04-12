import { loadRuntimeConfig } from "../core/load-runtime-config.js";
import { clearUserConfigKey, getUserConfigPath, writeUserConfig } from "../core/user-config.js";

export async function runModelCommand(modelName, options) {
  if (options.clearModel) {
    const cleared = await clearUserConfigKey("model");
    const payload = {
      cleared: true,
      configPath: cleared.path,
      model: null,
    };
    print(payload, options.json);
    return payload;
  }

  if (modelName) {
    const saved = await writeUserConfig({ model: modelName });
    const payload = {
      configPath: saved.path,
      model: modelName,
      saved: true,
    };
    print(payload, options.json);
    return payload;
  }

  const runtimeConfig = await loadRuntimeConfig(options);
  const payload = {
    configPath: getUserConfigPath(),
    model: runtimeConfig.model,
    persisted: runtimeConfig.persistedModel ?? null,
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
    console.log(`saved model: ${payload.model}`);
    console.log(`config: ${payload.configPath}`);
    return;
  }
  if (payload.cleared) {
    console.log(`cleared saved model in ${payload.configPath}`);
    return;
  }

  console.log(`current model: ${payload.model}`);
  if (payload.persisted) {
    console.log(`saved default: ${payload.persisted}`);
  }
  console.log(`config: ${payload.configPath}`);
}
