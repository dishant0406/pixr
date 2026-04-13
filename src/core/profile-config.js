import os from "node:os";

import { resolveUserPath } from "./load-runtime-config.js";
import { readUserConfig, writeUserConfig } from "./user-config.js";

const PROFILE_KEYS = ["count", "format", "height", "model", "outputDir", "prefix", "promptFile", "width"];

export function hasProfileInitOverrides(options) {
  return PROFILE_KEYS.some((key) => options[key] !== undefined) || Boolean(options.defaultProfile);
}

export function getProfilePatch(options, cwd, currentConfig = {}) {
  const patch = {};

  if (options.model) {
    patch.model = options.model;
  }
  if (options.output) {
    patch.outputDir = resolveUserPath(cwd, options.output);
  }
  if (options.format) {
    patch.format = options.format.toLowerCase();
  }
  if (options.width !== undefined) {
    patch.width = parsePositiveInteger(options.width, "width");
  }
  if (options.height !== undefined) {
    patch.height = parsePositiveInteger(options.height, "height");
  }
  if (options.count !== undefined) {
    patch.count = parsePositiveInteger(options.count, "count");
  }
  if (options.prefix) {
    patch.prefix = options.prefix;
  }
  if (options.promptFile) {
    patch.promptFile = resolveUserPath(cwd, options.promptFile);
  }

  return {
    count: patch.count ?? currentConfig.count ?? undefined,
    format: patch.format ?? currentConfig.format ?? undefined,
    height: patch.height ?? currentConfig.height ?? undefined,
    model: patch.model ?? currentConfig.model ?? undefined,
    outputDir: patch.outputDir ?? currentConfig.outputDir ?? undefined,
    prefix: patch.prefix ?? currentConfig.prefix ?? undefined,
    promptFile: patch.promptFile ?? currentConfig.promptFile ?? undefined,
    width: patch.width ?? currentConfig.width ?? undefined,
  };
}

export async function saveProfileConfig(name, profileConfig, configOptions = {}, homeDir = os.homedir()) {
  const currentConfig = await readUserConfig(homeDir);
  const currentProfiles = currentConfig.profiles && typeof currentConfig.profiles === "object"
    ? currentConfig.profiles
    : {};
  const currentProfile = currentProfiles[name] && typeof currentProfiles[name] === "object"
    ? currentProfiles[name]
    : {};
  const nextConfig = {
    ...currentConfig,
    ...(configOptions.defaultProfile ? { defaultProfile: name } : {}),
    profiles: {
      ...currentProfiles,
      [name]: compactProfile({
        ...currentProfile,
        ...profileConfig,
      }),
    },
  };

  const saved = await writeUserConfig(nextConfig, homeDir);
  return {
    config: nextConfig,
    path: saved.path,
  };
}

function compactProfile(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== "" && entry !== undefined && entry !== null),
  );
}

function parsePositiveInteger(value, label) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${label}: ${value}. Use a positive integer.`);
  }
  return parsed;
}
