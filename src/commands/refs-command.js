import { loadRuntimeConfig } from "../core/load-runtime-config.js";

export async function runRefsCommand(options) {
  const runtimeConfig = await loadRuntimeConfig(options);
  const payload = {
    count: runtimeConfig.referenceFiles.length,
    references: runtimeConfig.referenceFiles.map((file) => ({
      mimeType: file.mimeType,
      path: file.path,
      size: file.size,
    })),
    warnings: runtimeConfig.warnings,
  };

  if (options.json) {
    console.log(JSON.stringify(payload, null, 2));
    return payload;
  }

  if (!payload.references.length) {
    console.log("No default references found.");
    return payload;
  }

  for (const reference of payload.references) {
    console.log(reference.path);
  }
  for (const warning of payload.warnings) {
    console.error(`warning: ${warning}`);
  }
  return payload;
}
