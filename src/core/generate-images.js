import { readFile } from "node:fs/promises";

import { createGeminiClient } from "./gemini-client.js";
import { buildImageRequestConfig } from "./image-request-config.js";
import { MAX_INLINE_BYTES } from "./constants.js";
import { saveGeneratedFiles } from "./output-files.js";

export async function generateImages(prompt, runtimeConfig) {
  if (!runtimeConfig.apiKey) {
    throw new Error("Set NANO_IMAGE_API_KEY before generating images.");
  }

  const client = await createGeminiClient(runtimeConfig.apiKey);
  const imageRequestConfig = buildImageRequestConfig(runtimeConfig);
  const referenceData = await buildReferenceParts(client, runtimeConfig.referenceFiles, prompt, runtimeConfig.systemInstruction);
  const contents = referenceData.parts.length
    ? [{ role: "user", parts: [...referenceData.parts, { text: prompt }] }]
    : prompt;
  const response = await client.models.generateContent({
    config: {
      ...(imageRequestConfig.imageConfig ? { imageConfig: imageRequestConfig.imageConfig } : {}),
      ...(runtimeConfig.systemInstruction ? { systemInstruction: runtimeConfig.systemInstruction } : {}),
      responseModalities: ["IMAGE", "TEXT"],
    },
    contents,
    model: runtimeConfig.model,
  });
  const parts = response.candidates?.[0]?.content?.parts ?? [];

  if (parts.length === 0) {
    throw new Error("Gemini returned no content parts.");
  }

  const saved = await saveGeneratedFiles({
    format: imageRequestConfig.outputFormat,
    height: runtimeConfig.height,
    outputDir: runtimeConfig.outputDir,
    parts,
    prefix: runtimeConfig.prefix,
    prompt,
    width: runtimeConfig.width,
  });

  return {
    ...saved,
    model: runtimeConfig.model,
    prompt,
    referenceMode: referenceData.mode,
    references: runtimeConfig.referenceFiles,
    warnings: [...runtimeConfig.warnings, ...referenceData.warnings, ...imageRequestConfig.warnings],
  };
}
async function buildReferenceParts(client, referenceFiles, prompt, systemInstruction) {
  if (referenceFiles.length === 0) {
    return { mode: "none", parts: [], warnings: [] };
  }

  const textBytes = Buffer.byteLength(prompt) + Buffer.byteLength(systemInstruction ?? "");
  const inlineEstimate = referenceFiles.reduce((total, file) => total + Math.ceil(file.size * 1.37), textBytes);

  if (inlineEstimate <= MAX_INLINE_BYTES) {
    const parts = await Promise.all(referenceFiles.map(readInlinePart));
    return { mode: "inline", parts, warnings: [] };
  }

  const parts = [];
  for (const file of referenceFiles) {
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
    warnings: ["Reference images were uploaded with the Gemini Files API because the inline payload was large."],
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
