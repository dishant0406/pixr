import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  API_KEY_ENV,
  CLIENT_MODULE_ENV,
  LEGACY_API_KEY_ENV,
  LEGACY_CLIENT_MODULE_ENV,
} from "./constants.js";

export async function createGeminiClient(apiKey) {
  const clientModulePath = process.env[CLIENT_MODULE_ENV] ?? process.env[LEGACY_CLIENT_MODULE_ENV];

  if (clientModulePath) {
    const modulePath = path.resolve(clientModulePath);
    const moduleUrl = pathToFileURL(modulePath).href;
    const loaded = await import(moduleUrl);
    const createClient = loaded.createClient || loaded.default;
    if (typeof createClient !== "function") {
      throw new Error(`${CLIENT_MODULE_ENV} must export a client factory function.`);
    }
    return createClient({ apiKey });
  }

  const { GoogleGenAI } = await import("@google/genai");
  return new GoogleGenAI({ apiKey });
}

export async function listImageGenerationModels(apiKey) {
  if (!apiKey) {
    throw new Error(`Set ${API_KEY_ENV} before listing models. ${LEGACY_API_KEY_ENV} also works.`);
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
