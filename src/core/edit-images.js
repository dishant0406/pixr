import { API_KEY_ENV, LEGACY_API_KEY_ENV } from "./constants.js";
import { createGeminiClient } from "./gemini-client.js";
import { buildImageParts } from "./image-parts.js";
import { buildImageRequestConfig } from "./image-request-config.js";
import { saveGeneratedFiles } from "./output-files.js";

export async function editImages(prompt, runtimeConfig, options = {}) {
  if (!runtimeConfig.apiKey) {
    throw new Error(`Set ${API_KEY_ENV} before generating images. ${LEGACY_API_KEY_ENV} also works.`);
  }
  if (!runtimeConfig.inputFile) {
    throw new Error("Provide an input image with --input <path>.");
  }

  const client = await createGeminiClient(runtimeConfig.apiKey);
  const imageRequestConfig = buildImageRequestConfig(runtimeConfig);
  const imageFiles = [runtimeConfig.inputFile, ...runtimeConfig.referenceFiles];
  const imageData = await buildImageParts(client, imageFiles, prompt, runtimeConfig.systemInstruction);
  const count = normalizeCount(options.count);
  const savedResults = [];

  for (let index = 0; index < count; index += 1) {
    const response = await client.models.generateContent({
      config: {
        ...(imageRequestConfig.imageConfig ? { imageConfig: imageRequestConfig.imageConfig } : {}),
        ...(runtimeConfig.systemInstruction ? { systemInstruction: runtimeConfig.systemInstruction } : {}),
        responseModalities: ["IMAGE", "TEXT"],
      },
      contents: [{ role: "user", parts: [{ text: prompt }, ...imageData.parts] }],
      model: runtimeConfig.model,
    });
    const parts = response.candidates?.[0]?.content?.parts ?? [];

    if (parts.length === 0) {
      throw new Error("Gemini returned no content parts.");
    }

    savedResults.push(
      await saveGeneratedFiles({
        format: imageRequestConfig.outputFormat,
        height: runtimeConfig.height,
        outputDir: runtimeConfig.outputDir,
        parts,
        prefix: runtimeConfig.prefix,
        prompt,
        width: runtimeConfig.width,
      }),
    );
  }

  return {
    images: savedResults.flatMap((result) => result.images),
    input: runtimeConfig.inputFile.path,
    model: runtimeConfig.model,
    operation: options.mode,
    prompt,
    referenceMode: imageData.mode,
    references: runtimeConfig.referenceFiles,
    text: savedResults.flatMap((result) => result.text),
    textPaths: savedResults.map((result) => result.textPath).filter(Boolean),
    warnings: [...runtimeConfig.warnings, ...imageData.warnings, ...imageRequestConfig.warnings],
  };
}

function normalizeCount(value) {
  if (value === undefined) {
    return 1;
  }
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid count: ${value}. Use a positive integer.`);
  }
  return parsed;
}
