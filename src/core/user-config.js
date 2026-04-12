import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export function getUserConfigPath(homeDir = os.homedir()) {
  return path.join(homeDir, ".nano-img", "config.json");
}

export async function readUserConfig(homeDir = os.homedir()) {
  const filePath = getUserConfigPath(homeDir);

  try {
    return JSON.parse(await readFile(filePath, "utf8"));
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
