import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { CONFIG_DIR } from "./constants.js";
import { getConfigTemplate } from "./runtime-defaults.js";
import { getUserConfigPath, readUserConfig, writeUserConfig } from "./user-config.js";

const COMMAND_NAMES = ["generate", "edit", "vary"];

export function getPrimaryConfigDir(homeDir = os.homedir()) {
  return path.join(homeDir, path.basename(CONFIG_DIR));
}

export async function initPixrHome(homeDir = os.homedir()) {
  const configDir = getPrimaryConfigDir(homeDir);
  const created = [];
  const configPath = getUserConfigPath(homeDir);
  const currentConfig = await readUserConfig(homeDir);

  await ensureDir(configDir, created);
  await ensureDir(path.join(configDir, "assets"), created);
  await ensureDir(path.join(configDir, "profiles"), created);
  await ensureDir(path.join(configDir, "prompts"), created);

  for (const name of ["common", ...COMMAND_NAMES]) {
    await ensureDir(path.join(configDir, "assets", name), created);
  }

  await ensureFile(path.join(configDir, "INSTRUCTION.md"), "", created);
  await ensureFile(path.join(configDir, "STYLE.md"), "", created);

  for (const name of COMMAND_NAMES) {
    await ensureFile(path.join(configDir, "prompts", `${name}.md`), "", created);
  }

  if (!await hasExistingPath(configPath)) {
    await writeFile(
      configPath,
      `${JSON.stringify(
        Object.keys(currentConfig).length === 0 ? getConfigTemplate() : currentConfig,
        null,
        2,
      )}\n`,
      "utf8",
    );
    created.push(configPath);
  }

  return {
    configDir,
    configPath,
    created,
  };
}

export async function initProfileHome(name, homeDir = os.homedir()) {
  const profileName = validateProfileName(name);
  const scaffold = await initPixrHome(homeDir);
  const profileDir = path.join(scaffold.configDir, "profiles", profileName);
  const created = [...scaffold.created];

  await ensureDir(profileDir, created);
  await ensureDir(path.join(profileDir, "assets"), created);
  await ensureFile(path.join(profileDir, "INSTRUCTION.md"), "", created);
  await ensureFile(path.join(profileDir, "STYLE.md"), "", created);

  for (const assetDir of ["common", ...COMMAND_NAMES]) {
    await ensureDir(path.join(profileDir, "assets", assetDir), created);
  }

  const currentConfig = await readUserConfig(homeDir);
  const currentProfiles = currentConfig.profiles && typeof currentConfig.profiles === "object"
    ? currentConfig.profiles
    : {};

  if (!(profileName in currentProfiles)) {
    await writeUserConfig({
      ...currentConfig,
      profiles: {
        ...currentProfiles,
        [profileName]: {},
      },
    }, homeDir);
    if (!created.includes(scaffold.configPath)) {
      created.push(scaffold.configPath);
    }
  }

  return {
    created,
    profile: await describeProfile(profileName, homeDir),
  };
}

export async function listProfiles(homeDir = os.homedir()) {
  const userConfig = await readUserConfig(homeDir);
  const profileDir = path.join(getPrimaryConfigDir(homeDir), "profiles");
  const names = new Set(Object.keys(userConfig.profiles || {}));

  for (const entry of await readDirSafe(profileDir)) {
    if (entry.isDirectory()) {
      names.add(entry.name);
    }
  }

  return Promise.all([...names].sort().map((name) => describeProfile(name, homeDir, userConfig)));
}

export async function describeProfile(name, homeDir = os.homedir(), userConfig = null) {
  const profileName = validateProfileName(name);
  const config = userConfig || await readUserConfig(homeDir);
  const configDir = getPrimaryConfigDir(homeDir);
  const profileDir = path.join(configDir, "profiles", profileName);
  const profileConfig = config.profiles?.[profileName];

  return {
    name: profileName,
    defaultProfile: config.defaultProfile === profileName,
    configDefined: profileConfig && typeof profileConfig === "object",
    config: profileConfig && typeof profileConfig === "object" ? profileConfig : {},
    profileDir,
    profileDirExists: await hasExistingPath(profileDir),
    instructionPath: path.join(profileDir, "INSTRUCTION.md"),
    instructionExists: await hasExistingPath(path.join(profileDir, "INSTRUCTION.md")),
    stylePath: path.join(profileDir, "STYLE.md"),
    styleExists: await hasExistingPath(path.join(profileDir, "STYLE.md")),
    assetsPath: path.join(profileDir, "assets"),
    assetsExists: await hasExistingPath(path.join(profileDir, "assets")),
  };
}

function validateProfileName(name) {
  if (!name?.trim()) {
    throw new Error("Provide a profile name.");
  }
  const value = name.trim();
  if (!/^[a-z0-9][a-z0-9-_]*$/i.test(value)) {
    throw new Error(`Invalid profile name: ${name}. Use letters, numbers, dashes, or underscores.`);
  }
  return value;
}

async function ensureDir(dirPath, created) {
  if (await hasExistingPath(dirPath)) {
    return;
  }
  await mkdir(dirPath, { recursive: true });
  created.push(dirPath);
}

async function ensureFile(filePath, contents, created) {
  if (await hasExistingPath(filePath)) {
    return;
  }
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents, "utf8");
  created.push(filePath);
}

async function hasExistingPath(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readDirSafe(targetPath) {
  try {
    return await readdir(targetPath, { withFileTypes: true });
  } catch {
    return [];
  }
}
