import { API_KEY_ENV, LEGACY_API_KEY_ENV } from "../core/constants.js";
import { listImageGenerationModels } from "../core/gemini-client.js";
import { loadRuntimeConfig } from "../core/load-runtime-config.js";
import { selectOption } from "../core/select-option.js";
import { writeUserConfig } from "../core/user-config.js";

export async function runModelsCommand(options) {
  const apiKey = process.env[API_KEY_ENV] ?? process.env[LEGACY_API_KEY_ENV] ?? "";
  const models = await listImageGenerationModels(apiKey);
  const runtimeConfig = await loadRuntimeConfig(options);

  if (options.json) {
    console.log(JSON.stringify(models, null, 2));
    return models;
  }

  if (!options.noInteractive && process.stdin.isTTY && process.stdout.isTTY) {
    const selection = await selectOption(
      models.map((model) => ({
        detail: model.displayName || model.description,
        label: model.name,
        value: model.name,
      })),
      {
        currentValue: runtimeConfig.model,
        title: "Select the default Gemini image model",
      },
    );

    if (!selection) {
      console.log("model selection cancelled");
      return models;
    }

    const saved = await writeUserConfig({ model: selection.value });
    console.log(`saved model: ${selection.value}`);
    console.log(`config: ${saved.path}`);
    return models;
  }

  for (const model of models) {
    const label = model.displayName ? `${model.name} (${model.displayName})` : model.name;
    console.log(label);
  }
  return models;
}
