import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { CONFIG_DIR, LEGACY_CONFIG_DIR } from "./constants.js";

export function getUserConfigPath(homeDir = os.homedir()) {
  return path.join(homeDir, path.basename(CONFIG_DIR), "config.json");
}

function getLegacyUserConfigPath(homeDir = os.homedir()) {
  return path.join(homeDir, path.basename(LEGACY_CONFIG_DIR), "config.json");
}

export async function readUserConfig(homeDir = os.homedir()) {
  try {
    return JSON.parse(await readFile(getUserConfigPath(homeDir), "utf8"));
  } catch {}

  try {
    return JSON.parse(await readFile(getLegacyUserConfigPath(homeDir), "utf8"));
  } catch {
    return {};
  }
}

export async function writeUserConfig(patch, homeDir = os.homedir()) {
  const filePath = getUserConfigPath(homeDir);
  const nextConfig = {
    ...(await readUserConfig(homeDir)),
    ...patch,
  };

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(nextConfig, null, 2)}\n`, "utf8");
  return { config: nextConfig, path: filePath };
}

export async function clearUserConfigKey(key, homeDir = os.homedir()) {
  const filePath = getUserConfigPath(homeDir);
  const current = await readUserConfig(homeDir);

  delete current[key];

  if (Object.keys(current).length === 0) {
    await rm(filePath, { force: true });
    return { config: {}, path: filePath };
  }

  await writeFile(filePath, `${JSON.stringify(current, null, 2)}\n`, "utf8");
  return { config: current, path: filePath };
}
