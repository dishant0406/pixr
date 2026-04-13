import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import { IMAGE_EXTENSIONS, MAX_DEFAULT_REFERENCE_IMAGES, MAX_REFERENCE_IMAGES, MIME_TYPES } from "./constants.js";

export async function listDefaultReferenceFiles(assetDirs, warnings) {
  const files = [];

  for (const assetDir of assetDirs) {
    files.push(...(await listReferenceFilesInDirectory(assetDir)));
  }

  const uniqueFiles = dedupeReferenceFiles(files);
  if (uniqueFiles.length > MAX_DEFAULT_REFERENCE_IMAGES) {
    warnings.push(`Using the latest ${MAX_DEFAULT_REFERENCE_IMAGES} images for default references from pixr asset directories.`);
  }

  return uniqueFiles.slice(0, MAX_DEFAULT_REFERENCE_IMAGES).map((file) => file.path);
}

export async function readReferenceFiles(filePaths, warnings) {
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

export async function readRequiredImageFile(input, cwd) {
  if (!input) {
    return null;
  }

  const filePath = path.resolve(cwd, input);
  const fileStat = await stat(filePath).catch(() => null);

  if (!fileStat?.isFile()) {
    throw new Error(`Input image not found: ${input}`);
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES[ext];
  if (!mimeType) {
    throw new Error(`Unsupported input image type: ${input}`);
  }

  return { mimeType, path: filePath, size: fileStat.size };
}

export async function readOptionalText(filePath) {
  if (!filePath) {
    return "";
  }
  try {
    await access(filePath);
    return await readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

export async function hasExistingPath(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function getAssetDirs(assetsRoot, commandName) {
  const normalizedCommand = commandName === "gen" ? "generate" : commandName;
  return [
    path.join(assetsRoot, normalizedCommand),
    path.join(assetsRoot, "common"),
    assetsRoot,
  ];
}

async function listReferenceFilesInDirectory(assetsDir) {
  try {
    const entries = await readdir(assetsDir, { withFileTypes: true });
    const files = await Promise.all(entries
      .filter((entry) => entry.isFile())
      .map((entry) => path.join(assetsDir, entry.name))
      .filter((filePath) => IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase()))
      .map(async (filePath) => ({
        mtimeMs: (await stat(filePath)).mtimeMs,
        path: filePath,
      })));

    return files.sort((left, right) => right.mtimeMs - left.mtimeMs || left.path.localeCompare(right.path));
  } catch {
    return [];
  }
}

function dedupeReferenceFiles(files) {
  return [...new Map(files.map((file) => [file.path, file])).values()]
    .sort((left, right) => right.mtimeMs - left.mtimeMs || left.path.localeCompare(right.path));
}
