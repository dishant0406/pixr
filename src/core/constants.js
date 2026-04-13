import os from "node:os";
import path from "node:path";

export const APP_NAME = "pixr";
export const DEFAULT_MODEL = "gemini-2.5-flash-image";
export const DEFAULT_OUTPUT_FORMAT = "png";
export const MAX_REFERENCE_IMAGES = 14;
export const MAX_DEFAULT_REFERENCE_IMAGES = 3;
export const MAX_INLINE_BYTES = 18 * 1024 * 1024;
export const CONFIG_DIR = path.join(os.homedir(), ".pixr");
export const LEGACY_CONFIG_DIR = path.join(os.homedir(), ".nano-img");
export const LEGACY_STYLE_DIR = path.join(os.homedir(), ".nano-image");
export const API_KEY_ENV = "PIXR_API_KEY";
export const LEGACY_API_KEY_ENV = "NANO_IMAGE_API_KEY";
export const CLIENT_MODULE_ENV = "PIXR_CLIENT_MODULE";
export const LEGACY_CLIENT_MODULE_ENV = "NANO_IMAGE_CLIENT_MODULE";
export const MODEL_ENV = "PIXR_MODEL";
export const LEGACY_MODEL_ENV = "NANO_IMAGE_MODEL";
export const SUPPORTED_ASPECT_RATIOS = [
  "1:1",
  "2:3",
  "3:2",
  "3:4",
  "4:3",
  "9:16",
  "16:9",
  "21:9",
];
export const SUPPORTED_IMAGE_SIZES = {
  1024: "1K",
  2048: "2K",
  4096: "4K",
};
export const SUPPORTED_OUTPUT_FORMATS = new Set(["png", "jpg", "jpeg", "webp"]);
export const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
]);
export const MIME_TYPES = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};
