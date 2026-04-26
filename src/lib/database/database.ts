import { readTextFile } from "@tauri-apps/plugin-fs";

export type DatabaseFileContent = {
  version: string;
  manifest: Record<string, FileMetadata>;
};

export type FileMetadata = {
  tags: string[];
};

export const DATABASE_FILE_VERSION = "1.0";
export const DATABASE_FILE_NAME = "metadata.json";

export const parseDatabaseFile = async (
  filePath: string,
): Promise<DatabaseFileContent> => {
  const text = await readTextFile(filePath);

  try {
    const json = JSON.parse(text);

    // Validation basique de la structure attendue
    if (typeof json.version !== "string") {
      throw new Error("Invalid database file format: missing version");
    }

    if (typeof json.manifest !== "object" || json.manifest === null) {
      throw new Error("Invalid database file format: missing manifest");
    }

    const manifest: Record<string, FileMetadata> = {};

    for (const [key, value] of Object.entries<FileMetadata>(json.manifest)) {
      if (typeof value !== "object" || value === null) {
        throw new Error(
          `Invalid database file format: manifest entry "${key}" is not an object`,
        );
      }
      manifest[key] = {
        tags: Array.isArray(value.tags) ? value.tags : [],
      };
    }

    return {
      version: json.version,
      manifest,
    };
  } catch (error) {
    console.error("Error parsing database file:", error);
    throw new Error("Failed to parse database file");
  }
};

export const serializeDatabaseFile = (content: DatabaseFileContent): string => {
  return JSON.stringify(content);
};
