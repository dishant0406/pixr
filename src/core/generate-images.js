import { API_KEY_ENV, LEGACY_API_KEY_ENV } from "./constants.js";
import { createGeminiClient } from "./gemini-client.js";
import { buildImageParts } from "./image-parts.js";
import { buildImageRequestConfig } from "./image-request-config.js";
import { saveGeneratedFiles } from "./output-files.js";

export async function generateImages(prompt, runtimeConfig) {
  if (!runtimeConfig.apiKey) {
    throw new Error(`Set ${API_KEY_ENV} before generating images. ${LEGACY_API_KEY_ENV} also works.`);
  }

  const client = await createGeminiClient(runtimeConfig.apiKey);
  const imageRequestConfig = buildImageRequestConfig(runtimeConfig);
  const referenceData = await buildImageParts(client, runtimeConfig.referenceFiles, prompt, runtimeConfig.systemInstruction);
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
