import { ManifestContent, parseManifestFile } from "@lib/manifest/manifest";
import { useState } from "react";

export interface UseManifestResult {
  version: ManifestContent["version"];
  files: ManifestContent["files"];
  setFiles: (files: ManifestContent["files"]) => void;
  tags: ManifestContent["tags"];
  setTags: (
    tags:
      | ManifestContent["tags"]
      | ((prev: ManifestContent["tags"]) => ManifestContent["tags"]),
  ) => void;

  load(path: string): Promise<void>;
  set(content: ManifestContent): void;
  reset(): void;
  getContent(): ManifestContent;
  serialize(): string;

  // Méthodes pour gérer les tags
  getTagUseCount: (tagName: string) => number;
  renameTag: (oldName: string, newName: string) => void;
  changeTagColor: (tagName: string, color: string) => void;
  deleteTag: (tagName: string) => void;

  // Méthodes pour gérer les fichiers
  getFilesTags: () => string[];
  setFileTags: (fileName: string, tags: string[]) => void;
  addFileTags: (fileName: string, tags: string[]) => void;
  toggleFileTag: (fileName: string, tagName: string) => void;
  removeFileTags: (fileName: string, tags: string[]) => void;
  renameFile: (oldName: string, newName: string) => void;
  deleteFile: (name: string) => void;
  deleteFiles: (names: string[]) => void;
}

export function useManifest(): UseManifestResult {
  const [version, setVersion] = useState<ManifestContent["version"]>("1.0");
  const [files, setFiles] = useState<ManifestContent["files"]>({});
  const [tags, setTags] = useState<ManifestContent["tags"]>({});

  const load = async (path: string) => {
    const content = await parseManifestFile(path);
    setVersion(content.version);
    setFiles(content.files);
    setTags(content.tags);
  };

  const set = (content: ManifestContent) => {
    setVersion(content.version);
    setFiles(content.files);
    setTags(content.tags);
  };

  const reset = () => {
    setVersion("1.0");
    setFiles({});
    setTags({});
  };

  const getContent = (): ManifestContent => {
    return {
      version,
      files,
      tags,
    };
  };

  const serialize = (): string => {
    return JSON.stringify({
      version,
      files,
      tags,
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                              GESTION DES TAGS                              */
  /* -------------------------------------------------------------------------- */

  const getTagUseCount = (tagName: string): number => {
    return Object.values(files).reduce((count, file) => {
      return count + (file.tags.includes(tagName) ? 1 : 0);
    }, 0);
  };

  const renameTag = (oldName: string, newName: string) => {
    // 1. Renommer le tag dans la section "tags"
    setTags((prev) => {
      const updated = { ...prev };
      if (updated[oldName]) {
        updated[newName] = updated[oldName];
        delete updated[oldName];
      }
      return updated;
    });

    // 2. Mettre à jour tous les fichiers qui utilisent ce tag
    setFiles((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((file) => {
        if (updated[file].tags.includes(oldName)) {
          updated[file].tags = updated[file].tags.map((tag) =>
            tag === oldName ? newName : tag,
          );
        }
      });
      return updated;
    });
  };

  const changeTagColor = (tagName: string, color: string) => {
    setTags((prev) => {
      const updated = { ...prev };
      if (updated[tagName]) {
        updated[tagName].color = color;
      }
      return updated;
    });
  };

  const deleteTag = (tagName: string) => {
    // 1. Supprimer le tag de la section "tags"
    setTags((prev) => {
      const updated = { ...prev };
      delete updated[tagName];
      return updated;
    });

    // 2. Retirer le tag de tous les fichiers qui l'utilisent
    setFiles((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((file) => {
        if (updated[file].tags.includes(tagName)) {
          updated[file].tags = updated[file].tags.filter(
            (tag) => tag !== tagName,
          );
        }
      });
      return updated;
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                            GESTION DES FICHIERS                            */
  /* -------------------------------------------------------------------------- */

  /**
   * Récupère tous les tags présents dans le manifest
   * @returns Un tableau de tags
   */
  const getFilesTags = (): string[] => {
    const tagSet = new Set<string>();

    Object.values(files).forEach((file) => {
      file.tags.forEach((tag) => tagSet.add(tag));
    });

    return Array.from(tagSet);
  };

  const setFileTags = (fileName: string, tags: string[]) => {
    setFiles((prev) => {
      const updated = { ...prev };
      if (updated[fileName]) {
        updated[fileName].tags = tags;
      }
      return updated;
    });
  };

  const toggleFileTag = (fileName: string, tagName: string) => {
    setFiles((prev) => {
      const updated = { ...prev };
      if (updated[fileName]) {
        if (updated[fileName].tags.includes(tagName)) {
          updated[fileName].tags = updated[fileName].tags.filter(
            (tag) => tag !== tagName,
          );
        } else {
          updated[fileName].tags.push(tagName);
        }
      }
      return updated;
    });
  };

  const addFileTags = (fileName: string, tags: string[]) => {
    setFiles((prev) => {
      const updated = { ...prev };
      if (updated[fileName]) {
        updated[fileName].tags = Array.from(
          new Set([...updated[fileName].tags, ...tags]),
        );
      }
      return updated;
    });
  };

  const removeFileTags = (fileName: string, tags: string[]) => {
    setFiles((prev) => {
      const updated = { ...prev };
      if (updated[fileName]) {
        updated[fileName].tags = updated[fileName].tags.filter(
          (tag) => !tags.includes(tag),
        );
      }
      return updated;
    });
  };

  const renameFile = (oldName: string, newName: string) => {
    setFiles((prev) => {
      const updated = { ...prev };
      if (updated[oldName]) {
        updated[newName] = updated[oldName];
        delete updated[oldName];
      }
      return updated;
    });
  };

  const deleteFile = (name: string) => {
    setFiles((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  const deleteFiles = (names: string[]) => {
    setFiles((prev) => {
      const updated = { ...prev };
      names.forEach((name) => delete updated[name]);
      return updated;
    });
  };

  /* --------------------------------- RETURN --------------------------------- */
  return {
    version,
    files,
    setFiles,
    tags,
    setTags,

    load,
    set,
    reset,
    getContent,
    serialize,

    // Méthodes pour gérer les tags
    getTagUseCount,
    renameTag,
    changeTagColor,
    deleteTag,

    // Méthodes pour gérer les fichiers
    getFilesTags,
    setFileTags,
    toggleFileTag,
    addFileTags,
    removeFileTags,
    renameFile,
    deleteFile,
    deleteFiles,
  };
}
