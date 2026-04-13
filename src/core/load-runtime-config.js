import { access, readdir, readFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  API_KEY_ENV,
  APP_NAME,
  CONFIG_DIR,
  DEFAULT_MODEL,
  DEFAULT_OUTPUT_FORMAT,
  IMAGE_EXTENSIONS,
  LEGACY_API_KEY_ENV,
  LEGACY_CONFIG_DIR,
  LEGACY_MODEL_ENV,
  LEGACY_STYLE_DIR,
  MAX_REFERENCE_IMAGES,
  MODEL_ENV,
  MIME_TYPES,
} from "./constants.js";
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
  const apiKey = process.env[API_KEY_ENV] ?? process.env[LEGACY_API_KEY_ENV] ?? "";
  const modelEnv = process.env[MODEL_ENV] ?? process.env[LEGACY_MODEL_ENV];

  if (!options.noDefaultRefs) {
    refs.push(...(await listDefaultReferenceFiles(path.join(configDir, "assets"), warnings)));
  }

  refs.push(...(options.refs ?? []).map((item) => path.resolve(cwd, item)));

  const referenceFiles = await readReferenceFiles(refs, warnings);
  const instructionPath = options.instructionFile
    ? path.resolve(cwd, options.instructionFile)
    : path.join(configDir, "INSTRUCTION.md");
  const stylePath = await resolveStylePath(options.styleFile, cwd, homeDir);
  const instructionText = await readOptionalText(instructionPath);
  const styleText = await readOptionalText(stylePath);

  return {
    apiKey,
    configPath: getUserConfigPath(homeDir),
    format: parseOutputFormat(options.format),
    hasApiKey: Boolean(apiKey),
    height: parseDimension(options.height, "height"),
    instructionPath,
    model: options.model || modelEnv || userConfig.model || DEFAULT_MODEL,
    outputDir: resolveOutputDir(cwd, options.output, userConfig.outputDir),
    persistedModel: userConfig.model || null,
    persistedOutputDir: userConfig.outputDir || null,
    prefix: sanitizePrefix(options.prefix || APP_NAME),
    referenceFiles,
    stylePath,
    systemInstruction: buildSystemInstruction(instructionText, styleText),
    width: parseDimension(options.width, "width"),
    warnings,
  };
}

async function resolveConfigDir(homeDir) {
  const primary = path.join(homeDir, path.basename(CONFIG_DIR));
  const legacy = path.join(homeDir, path.basename(LEGACY_CONFIG_DIR));
  if (await exists(primary)) {
    return primary;
  }
  if (await exists(legacy)) {
    return legacy;
  }
  return primary;
}

async function listDefaultReferenceFiles(assetsDir, warnings) {
  try {
    const entries = await readdir(assetsDir, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => path.join(assetsDir, entry.name))
      .filter((filePath) => IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase()))
      .sort();

    if (files.length > MAX_REFERENCE_IMAGES) {
      warnings.push(`Using the first ${MAX_REFERENCE_IMAGES} default references from ${assetsDir}.`);
    }

    return files.slice(0, MAX_REFERENCE_IMAGES);
  } catch {
    return [];
  }
}

async function readReferenceFiles(filePaths, warnings) {
  const uniquePaths = [...new Set(filePaths)];
  const references = [];

  for (const filePath of uniquePaths) {
    try {
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) {
        continue;
      }
      const ext = path.extname(filePath).toLowerCase();
      const mimeType = MIME_TYPES[ext];
      if (!mimeType) {
        warnings.push(`Skipping unsupported reference file: ${filePath}`);
        continue;
      }
      references.push({ mimeType, path: filePath, size: fileStat.size });
    } catch {
      warnings.push(`Skipping missing reference file: ${filePath}`);
    }
  }

  return references.slice(0, MAX_REFERENCE_IMAGES);
}

async function readOptionalText(filePath) {
  try {
    await access(filePath);
    return await readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

async function resolveStylePath(styleFile, cwd, homeDir) {
  if (styleFile) {
    return path.resolve(cwd, styleFile);
  }

  const primary = path.join(homeDir, path.basename(CONFIG_DIR), "STYLE.md");
  const legacy = path.join(homeDir, path.basename(LEGACY_STYLE_DIR), "STYLE.md");

  if (await exists(primary)) {
    return primary;
  }
  if (await exists(legacy)) {
    return legacy;
  }
  return primary;
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

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
