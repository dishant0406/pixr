import os from "node:os";
import path from "node:path";

import {
  API_KEY_ENV,
  APP_NAME,
  CONFIG_DIR,
  DEFAULT_MODEL,
  DEFAULT_OUTPUT_FORMAT,
  LEGACY_API_KEY_ENV,
  LEGACY_CONFIG_DIR,
  LEGACY_MODEL_ENV,
  LEGACY_STYLE_DIR,
  MODEL_ENV,
} from "./constants.js";
import {
  listDefaultReferenceFiles,
  readOptionalText,
  readReferenceFiles,
  readRequiredImageFile,
} from "./runtime-file-inputs.js";
import {
  resolveConfigDir,
  resolveDefaultAssetDirs,
  resolveInstructionPath,
  resolveStylePath,
} from "./runtime-paths.js";
import { getDefaultPrefix, resolveConfigDefaults, resolvePromptTemplate } from "./runtime-defaults.js";
import { getUserConfigPath, readUserConfig } from "./user-config.js";

export function buildSystemInstruction(instructionText, styleText) {
  const parts = [];

  if (instructionText?.trim()) {
    parts.push(`Instructions:\n${instructionText.trim()}`);
  }
  if (styleText?.trim()) {
    parts.push(`Style:\n${styleText.trim()}`);
  }

  return parts.join("\n\n") || undefined;
}

export async function loadRuntimeConfig(options = {}, overrides = {}) {
  const cwd = overrides.cwd ?? process.cwd();
  const homeDir = overrides.homeDir ?? os.homedir();
  const configDir = await resolveConfigDir(homeDir);
  const warnings = [];
  const refs = [];
  const userConfig = await readUserConfig(homeDir);
  const commandName = options.commandName || "generate";
  const configState = resolveConfigDefaults({
    commandName,
    cwd,
    userConfig: {
      ...userConfig,
      ...(options.profile ? { __requestedProfile: options.profile } : {}),
    },
  });
  const resolvedDefaults = configState.defaults;
  const apiKey = process.env[API_KEY_ENV] ?? process.env[LEGACY_API_KEY_ENV] ?? "";
  const modelEnv = process.env[MODEL_ENV] ?? process.env[LEGACY_MODEL_ENV];
  const noDefaultRefs = options.noDefaultRefs ?? resolvedDefaults.noDefaultRefs ?? false;

  if (!noDefaultRefs) {
    refs.push(...(await listDefaultReferenceFiles(
      await resolveDefaultAssetDirs({
        commandName,
        configDir,
        profile: configState.selectedProfile,
      }),
      warnings,
    )));
  }

  refs.push(...(options.refs ?? []).map((item) => path.resolve(cwd, item)));

  const referenceFiles = await readReferenceFiles(refs, warnings);
  const instructionPath = await resolveInstructionPath({
    configDir,
    cwd,
    instructionFile: options.instructionFile,
    profile: configState.selectedProfile,
  });
  const stylePath = await resolveStylePath({
    configDir,
    cwd,
    homeDir,
    profile: configState.selectedProfile,
    styleFile: options.styleFile,
  });
  const promptState = await resolvePromptTemplate({
    commandName,
    configDir,
    cwd,
    promptFile: options.promptFile || resolvedDefaults.promptFile,
  });
  const instructionText = await readOptionalText(instructionPath);
  const styleText = await readOptionalText(stylePath);

  return {
    apiKey,
    commandName,
    configPath: getUserConfigPath(homeDir),
    count: parseCount(options.count ?? resolvedDefaults.count),
    format: parseOutputFormat(options.format || resolvedDefaults.format),
    hasApiKey: Boolean(apiKey),
    height: parseDimension(options.height ?? resolvedDefaults.height, "height"),
    inputFile: await readRequiredImageFile(options.input, cwd),
    instructionPath,
    model: options.model || (options.profile ? resolvedDefaults.model : null) || modelEnv || resolvedDefaults.model || DEFAULT_MODEL,
    noDefaultRefs,
    outputDir: resolveOutputDir(cwd, options.output, resolvedDefaults.outputDir),
    persistedModel: userConfig.model || null,
    persistedOutputDir: userConfig.outputDir || null,
    prefix: sanitizePrefix(options.prefix || resolvedDefaults.prefix || getDefaultPrefix(commandName)),
    profile: configState.selectedProfile,
    profileSource: configState.selectedProfileSource,
    promptFilePath: promptState.path,
    promptTemplate: promptState.text,
    referenceFiles,
    requestedProfile: options.profile || null,
    stylePath,
    systemInstruction: buildSystemInstruction(instructionText, styleText),
    width: parseDimension(options.width ?? resolvedDefaults.width, "width"),
    warnings,
  };
}
function sanitizePrefix(value) {
  const cleaned = value.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "");
  return cleaned || APP_NAME;
}

function parseDimension(value, label) {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${label}: ${value}. Use a positive integer.`);
  }
  return parsed;
}

function parseOutputFormat(value) {
  return value?.toLowerCase() || DEFAULT_OUTPUT_FORMAT;
}

function parseCount(value) {
  if (value === undefined || value === null || value === "") {
    return 1;
  }
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid count: ${value}. Use a positive integer.`);
  }
  return parsed;
}

function resolveOutputDir(cwd, optionValue, persistedValue) {
  if (optionValue) {
    return resolveUserPath(cwd, optionValue);
  }
  if (persistedValue) {
    return resolveUserPath(cwd, persistedValue);
  }
  return path.resolve(cwd, ".");
}

export function resolveUserPath(cwd, value) {
  if (!value) {
    return path.resolve(cwd, ".");
  }
  if (value === "~") {
    return os.homedir();
  }
  if (value.startsWith("~/")) {
    return path.join(os.homedir(), value.slice(2));
  }
  return path.resolve(cwd, value);
}
