import { readTextFile } from "@tauri-apps/plugin-fs";

export type TagMetadata = {
  color: string;
};

export type FileMetadata = {
  tags: string[];
};

export type ManifestContent = {
  version: string;
  tags: Record<string, TagMetadata>;
  files: Record<string, FileMetadata>;
};

export const MANIFEST_FILE_VERSION = "1.0";
export const MANIFEST_FILE_NAME = "manifest.json";

export const parseManifestFile = async (
  filePath: string,
): Promise<ManifestContent> => {
  const text = await readTextFile(filePath);

  try {
    const json = JSON.parse(text);

    // Validation basique de la structure attendue
    if (typeof json.version !== "string") {
      throw new Error("Invalid database file format: missing version");
    }

    if (typeof json.tags !== "object" || json.tags === null) {
      throw new Error("Invalid database file format: missing tags");
    }

    if (typeof json.files !== "object" || json.files === null) {
      throw new Error("Invalid database file format: missing files");
    }

    const tags: Record<string, { color: string }> = {};

    for (const [key, value] of Object.entries<{ color: string }>(json.tags)) {
      if (
        typeof value !== "object" ||
        value === null ||
        typeof value.color !== "string"
      ) {
        throw new Error(
          `Invalid database file format: tag "${key}" is not valid`,
        );
      }
      tags[key] = { color: value.color };
    }

    const files: Record<string, FileMetadata> = {};

    for (const [key, value] of Object.entries<FileMetadata>(json.files)) {
      if (typeof value !== "object" || value === null) {
        throw new Error(
          `Invalid database file format: manifest entry "${key}" is not an object`,
        );
      }
      files[key] = {
        tags: Array.isArray(value.tags) ? value.tags : [],
      };
    }

    return {
      version: json.version,
      tags,
      files,
    };
  } catch (error) {
    console.error("Error parsing database file:", error);
    throw new Error("Failed to parse database file");
  }
};
