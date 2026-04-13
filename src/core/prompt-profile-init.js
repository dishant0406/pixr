import readline from "node:readline/promises";

import { API_KEY_ENV, DEFAULT_MODEL, DEFAULT_OUTPUT_FORMAT, LEGACY_API_KEY_ENV } from "./constants.js";
import { listImageGenerationModels } from "./gemini-client.js";
import { selectOption } from "./select-option.js";

const KNOWN_MODELS = ["gemini-2.5-flash-image", "gemini-3.1-flash-image-preview"];

export async function promptForProfileInit(name, currentConfig) {
  const model = await promptForModel(currentConfig.model);
  if (!model) {
    throw new Error("Profile setup cancelled.");
  }

  const format = await promptForSelect(
    [
      { label: "png", value: "png" },
      { label: "jpg", value: "jpg" },
      { label: "webp", value: "webp" },
    ],
    currentConfig.format || DEFAULT_OUTPUT_FORMAT,
    `Choose the default output format for profile "${name}"`,
  );
  if (!format) {
    throw new Error("Profile setup cancelled.");
  }

  const defaultProfile = await promptForSelect(
    [
      { label: "yes", value: "yes" },
      { label: "no", value: "no" },
    ],
    "no",
    `Set "${name}" as the default profile?`,
  );
  if (!defaultProfile) {
    throw new Error("Profile setup cancelled.");
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    return {
      count: await askInteger(rl, `Default variation count [${currentConfig.count || 3}]: `, currentConfig.count ?? 3),
      defaultProfile: defaultProfile.value === "yes",
      format: format.value,
      height: await askInteger(rl, `Default height [${currentConfig.height || ""}]: `, currentConfig.height),
      model: model.value,
      output: await askText(rl, `Default save directory [${currentConfig.outputDir || ""}]: `, currentConfig.outputDir),
      prefix: await askText(rl, `Default filename prefix [${currentConfig.prefix || ""}]: `, currentConfig.prefix),
      promptFile: await askText(rl, `Prompt file path [${currentConfig.promptFile || ""}]: `, currentConfig.promptFile),
      width: await askInteger(rl, `Default width [${currentConfig.width || ""}]: `, currentConfig.width),
    };
  } finally {
    rl.close();
  }
}

async function promptForModel(currentModel) {
  const apiKey = process.env[API_KEY_ENV] ?? process.env[LEGACY_API_KEY_ENV] ?? "";
  const modelNames = await getModelNames(apiKey, currentModel);
  return promptForSelect(
    modelNames.map((value) => ({ label: value, value })),
    currentModel || DEFAULT_MODEL,
    "Choose the default Gemini image model for this profile",
  );
}

async function getModelNames(apiKey, currentModel) {
  if (apiKey) {
    try {
      const models = await listImageGenerationModels(apiKey);
      return [...new Set([...models.map((model) => model.name), currentModel].filter(Boolean))];
    } catch {}
  }

  return [...new Set([...KNOWN_MODELS, currentModel].filter(Boolean))];
}

function promptForSelect(options, currentValue, title) {
  return selectOption(options, {
    currentValue,
    title,
  });
}

async function askText(rl, question, fallback) {
  const answer = (await rl.question(question)).trim();
  return answer || fallback || "";
}

async function askInteger(rl, question, fallback) {
  const answer = (await rl.question(question)).trim();
  if (!answer) {
    return fallback;
  }
  const parsed = Number.parseInt(answer, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid number: ${answer}. Use a positive integer.`);
  }
  return parsed;
}
