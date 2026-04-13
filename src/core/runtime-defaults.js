import path from "node:path";

import { APP_NAME, CONFIG_DIR } from "./constants.js";
import { hasExistingPath, readOptionalText } from "./runtime-file-inputs.js";
import { resolveUserPath } from "./load-runtime-config.js";

const DEFAULT_KEYS = new Set([
  "count",
  "format",
  "height",
  "model",
  "noDefaultRefs",
  "outputDir",
  "prefix",
  "promptFile",
  "width",
]);

export function resolveConfigDefaults({ commandName, cwd, userConfig }) {
  const baseDefaults = pickDefaults(userConfig);
  const commandDefaults = pickDefaults(userConfig.commands?.[normalizeCommandName(commandName)]);
  const selectedProfile = resolveProfile(userConfig, commandName);
  const profileDefaults = pickDefaults(selectedProfile?.config);

  return {
    defaults: {
      ...baseDefaults,
      ...commandDefaults,
      ...profileDefaults,
    },
    selectedProfile: selectedProfile?.name || null,
    selectedProfileSource: selectedProfile?.source || null,
    userConfig,
  };
}

export async function resolvePromptTemplate({ commandName, configDir, cwd, promptFile }) {
  const configuredPath = promptFile ? resolveUserPath(cwd, promptFile) : null;
  if (configuredPath) {
    return {
      path: configuredPath,
      text: await readOptionalText(configuredPath),
    };
  }

  const autoPath = path.join(configDir, "prompts", `${normalizeCommandName(commandName)}.md`);
  if (await hasExistingPath(autoPath)) {
    return {
      path: autoPath,
      text: await readOptionalText(autoPath),
    };
  }

  return {
    path: autoPath,
    text: "",
  };
}

export function buildPrompt({ commandName, fallbackPrompt, prompt, promptTemplate }) {
  const promptParts = [promptTemplate?.trim(), prompt?.trim()].filter(Boolean);
  const combined = promptParts.join("\n\n").trim();

  if (combined) {
    return combined;
  }

  if (fallbackPrompt) {
    return fallbackPrompt;
  }

  throw new Error(`Provide a ${normalizeCommandName(commandName)} prompt, or pipe one into stdin.`);
}

export function getDefaultPrefix(commandName) {
  const normalized = normalizeCommandName(commandName);
  if (normalized === "edit") {
    return "pixr-edit";
  }
  if (normalized === "vary") {
    return "pixr-vary";
  }
  return APP_NAME;
}

export function getConfigTemplate() {
  return {
    commands: {
      vary: {
        count: 3,
      },
    },
    profiles: {},
  };
}

function pickDefaults(source) {
  if (!source || typeof source !== "object") {
    return {};
  }

  return Object.fromEntries(Object.entries(source).filter(([key]) => DEFAULT_KEYS.has(key)));
}

function resolveProfile(userConfig, commandName) {
  const explicitName = userConfig.__requestedProfile || null;
  const defaultName = userConfig.defaultProfile || null;
  const profileName = explicitName || defaultName;

  if (!profileName) {
    return null;
  }

  const rawProfile = userConfig?.profiles?.[profileName];
  const baseProfile = rawProfile && typeof rawProfile === "object" ? rawProfile : {};

  const commandConfig = baseProfile.commands?.[normalizeCommandName(commandName)];

  return {
    config: {
      ...baseProfile,
      ...(commandConfig && typeof commandConfig === "object" ? commandConfig : {}),
    },
    name: profileName,
    source: explicitName ? "cli" : "config",
  };
}

function normalizeCommandName(commandName) {
  return commandName === "gen" ? "generate" : commandName;
}
