import { join } from "@tauri-apps/api/path";
import { readDir, stat } from "@tauri-apps/plugin-fs";
import { EXTENSION_MAP } from "./extension";

export interface FileItem {
  // Nom du fichier avec extension
  name: string;
  extension: string;
  // Taille en octets
  size: number;
  date: Date;
  path: string;
}

export interface FileItemWithMetadata extends FileItem {
  tags: string[];
}

export type FileCategory =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "code"
  | "other";

/**
 * Lit les fichiers d'un répertoire et retourne une liste de FileItem avec leurs métadonnées
 * @param directory Le chemin du répertoire à lire
 * @returns Une promesse qui résout une liste de FileItem
 */
export const getFiles = async (directory: string): Promise<FileItem[]> => {
  const entries = await readDir(directory);

  // Garder que les fichiers
  const fileEntries = entries.filter((entry) => entry.isFile);

  const formattedFilePromises = fileEntries.map(async (entry) => {
    const fullPath = await join(directory, entry.name || "");
    const extension = entry.name.split(".").pop() || "";
    const fileMetadata = await stat(fullPath);

    return {
      name: entry.name,
      path: fullPath,
      extension,
      date: fileMetadata.birthtime ?? new Date(),
      size: fileMetadata.size,
    };
  });

  return Promise.all(formattedFilePromises);
};

/**
 * Détermine la catégorie d'un fichier à partir de son extension
 * @param extension L'extension du fichier (ex: "jpg", "mp4", "pdf")
 * @returns La catégorie du fichier (ex: "image", "video", "document")
 */
export const getFileCategory = (extension: string): FileCategory => {
  return EXTENSION_MAP[extension.toLowerCase()] || "other";
};

/**
 * Supprime l'extension d'un nom de fichier
 * @param filename Le nom du fichier avec extension
 * @returns Le nom du fichier sans extension
 */
export const removeExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return filename;
  return filename.slice(0, lastDotIndex);
};
