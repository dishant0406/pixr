import path from "node:path";
import { pathToFileURL } from "node:url";

export async function createGeminiClient(apiKey) {
  if (process.env.NANO_IMAGE_CLIENT_MODULE) {
    const modulePath = path.resolve(process.env.NANO_IMAGE_CLIENT_MODULE);
    const moduleUrl = pathToFileURL(modulePath).href;
    const loaded = await import(moduleUrl);
    const createClient = loaded.createClient || loaded.default;
    if (typeof createClient !== "function") {
      throw new Error("NANO_IMAGE_CLIENT_MODULE must export a client factory function.");
    }
    return createClient({ apiKey });
  }

  const { GoogleGenAI } = await import("@google/genai");
  return new GoogleGenAI({ apiKey });
}

export async function listImageGenerationModels(apiKey) {
  if (!apiKey) {
    throw new Error("Set NANO_IMAGE_API_KEY before listing models.");
  }

  const client = await createGeminiClient(apiKey);
  const models = [];
  const pager = await client.models.list();

  for await (const model of pager) {
    if (isImageGenerationModel(model)) {
      models.push({
        description: model.description || "",
        displayName: model.displayName || "",
        inputTokenLimit: model.inputTokenLimit ?? null,
        name: normalizeModelName(model.name),
        outputTokenLimit: model.outputTokenLimit ?? null,
        supportedActions: model.supportedActions ?? [],
      });
    }
  }

  return models.sort((a, b) => a.name.localeCompare(b.name));
}

function isImageGenerationModel(model) {
  const name = normalizeModelName(model.name).toLowerCase();
  const actions = new Set(model.supportedActions ?? []);

  return (
    name.includes("image") &&
    (actions.has("generateContent") || actions.has("create") || actions.size === 0)
  );
}

function normalizeModelName(name = "") {
  return name.replace(/^models\//, "");
}
