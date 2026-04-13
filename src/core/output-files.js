import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const extensions = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function saveGeneratedFiles({ format, height, outputDir, parts, prefix, prompt, width }) {
  const stamp = `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`;
  const baseName = `${prefix}-${slugify(prompt).slice(0, 48) || "image"}-${stamp}`;
  const images = [];
  const textParts = [];

  await mkdir(outputDir, { recursive: true });

  for (const part of parts) {
    if (part.text?.trim()) {
      textParts.push(part.text.trim());
      continue;
    }
    if (!part.inlineData?.data) {
      continue;
    }
    const ext = normalizeOutputExtension(format || extensions[part.inlineData.mimeType] || "png");
    const imagePath = path.join(outputDir, `${baseName}-${String(images.length + 1).padStart(2, "0")}.${ext}`);
    await writeImageFile({
      format: ext,
      height,
      imagePath,
      input: Buffer.from(part.inlineData.data, "base64"),
      width,
    });
    images.push(imagePath);
  }

  const textPath = textParts.length
    ? path.join(outputDir, `${baseName}.txt`)
    : undefined;

  if (textPath) {
    await writeFile(textPath, `${textParts.join("\n\n")}\n`, "utf8");
  }

  return { images, text: textParts, textPath };
}

async function writeImageFile({ format, height, imagePath, input, width }) {
  let pipeline = sharp(input, { animated: false });

  if (width || height) {
    pipeline = pipeline.resize({
      fit: width && height ? "fill" : "inside",
      height,
      width,
    });
  }

  if (format === "jpg") {
    pipeline = pipeline.jpeg();
  } else if (format === "webp") {
    pipeline = pipeline.webp();
  } else {
    pipeline = pipeline.png();
  }

  await writeFile(imagePath, await pipeline.toBuffer());
}

function normalizeOutputExtension(format) {
  return format === "jpeg" ? "jpg" : format;
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
