import {
  DEFAULT_OUTPUT_FORMAT,
  SUPPORTED_ASPECT_RATIOS,
  SUPPORTED_IMAGE_SIZES,
  SUPPORTED_OUTPUT_FORMATS,
} from "./constants.js";

export function buildImageRequestConfig({ format, height, width }) {
  const outputFormat = normalizeFormat(format);
  const imageConfig = {};
  const warnings = [];

  if (width && height) {
    const aspectRatio = findSupportedAspectRatio(width, height);
    if (aspectRatio) {
      imageConfig.aspectRatio = aspectRatio;
    }
    warnings.push("Gemini native image generation does not take exact width/height. Exact resizing will be applied locally after generation.");
  }

  const imageSize = findSupportedImageSize(width, height);
  if (imageSize) {
    imageConfig.imageSize = imageSize;
  } else if (width || height) {
    warnings.push("Gemini native image generation only supports preset image sizes. The requested dimensions will be applied locally after generation.");
  }

  if (outputFormat !== "png") {
    warnings.push(`Gemini native image generation does not support output format selection. The result will be converted to ${outputFormat} locally.`);
  }

  return {
    imageConfig: Object.keys(imageConfig).length ? imageConfig : undefined,
    outputFormat,
    warnings: [...new Set(warnings)],
  };
}

function normalizeFormat(format = DEFAULT_OUTPUT_FORMAT) {
  const normalized = format.toLowerCase();
  if (!SUPPORTED_OUTPUT_FORMATS.has(normalized)) {
    throw new Error(`Unsupported output format: ${format}. Use png, jpg, jpeg, or webp.`);
  }
  return normalized === "jpeg" ? "jpg" : normalized;
}

function findSupportedAspectRatio(width, height) {
  const actualRatio = width / height;

  for (const ratio of SUPPORTED_ASPECT_RATIOS) {
    const [left, right] = ratio.split(":").map(Number);
    if (Math.abs(actualRatio - left / right) < 0.001) {
      return ratio;
    }
  }

  return undefined;
}

function findSupportedImageSize(width, height) {
  const largestDimension = Math.max(width || 0, height || 0);
  return SUPPORTED_IMAGE_SIZES[largestDimension] || undefined;
}
