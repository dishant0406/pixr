import path from "node:path";

import { CONFIG_DIR, LEGACY_CONFIG_DIR, LEGACY_STYLE_DIR } from "./constants.js";
import { getAssetDirs, hasExistingPath } from "./runtime-file-inputs.js";

export async function resolveConfigDir(homeDir) {
  const primary = path.join(homeDir, path.basename(CONFIG_DIR));
  const legacy = path.join(homeDir, path.basename(LEGACY_CONFIG_DIR));
  if (await hasExistingPath(primary)) {
    return primary;
  }
  if (await hasExistingPath(legacy)) {
    return legacy;
  }
  return primary;
}

export async function resolveInstructionPath({ configDir, cwd, instructionFile, profile }) {
  if (instructionFile) {
    return path.resolve(cwd, instructionFile);
  }

  const profilePath = profile
    ? path.join(configDir, "profiles", profile, "INSTRUCTION.md")
    : null;

  if (profilePath && await hasExistingPath(profilePath)) {
    return profilePath;
  }

  return path.join(configDir, "INSTRUCTION.md");
}

export async function resolveStylePath({ configDir, cwd, homeDir, profile, styleFile }) {
  if (styleFile) {
    return path.resolve(cwd, styleFile);
  }

  const profilePath = profile
    ? path.join(configDir, "profiles", profile, "STYLE.md")
    : null;

  if (profilePath && await hasExistingPath(profilePath)) {
    return profilePath;
  }

  const primary = path.join(configDir, "STYLE.md");
  const legacy = path.join(homeDir, path.basename(LEGACY_STYLE_DIR), "STYLE.md");

  if (await hasExistingPath(primary)) {
    return primary;
  }
  if (await hasExistingPath(legacy)) {
    return legacy;
  }
  return primary;
}

export async function resolveDefaultAssetDirs({ commandName, configDir, profile }) {
  if (!profile) {
    return getAssetDirs(path.join(configDir, "assets"), commandName);
  }

  const profileAssetRoot = path.join(configDir, "profiles", profile, "assets");
  const profileAssetDirs = getAssetDirs(profileAssetRoot, commandName);

  if (await hasExistingPath(profileAssetRoot)) {
    return profileAssetDirs;
  }

  return getAssetDirs(path.join(configDir, "assets"), commandName);
}
