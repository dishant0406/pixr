import { readFile } from "node:fs/promises";

import { MAX_INLINE_BYTES } from "./constants.js";

export async function buildImageParts(client, imageFiles, prompt, systemInstruction) {
  if (imageFiles.length === 0) {
    return { mode: "none", parts: [], warnings: [] };
  }

  const textBytes = Buffer.byteLength(prompt) + Buffer.byteLength(systemInstruction ?? "");
  const inlineEstimate = imageFiles.reduce((total, file) => total + Math.ceil(file.size * 1.37), textBytes);

  if (inlineEstimate <= MAX_INLINE_BYTES) {
    const parts = await Promise.all(imageFiles.map(readInlinePart));
    return { mode: "inline", parts, warnings: [] };
  }

  const parts = [];
  for (const file of imageFiles) {
    const uploaded = await client.files.upload({
      config: { mimeType: file.mimeType },
      file: file.path,
    });
    parts.push({
      fileData: {
        fileUri: uploaded.uri,
        mimeType: uploaded.mimeType || file.mimeType,
      },
    });
  }

  return {
    mode: "files-api",
    parts,
    warnings: ["Input images were uploaded with the Gemini Files API because the inline payload was large."],
  };
}

async function readInlinePart(file) {
  const bytes = await readFile(file.path);
  return {
    inlineData: {
      data: bytes.toString("base64"),
      mimeType: file.mimeType,
    },
  };
}
