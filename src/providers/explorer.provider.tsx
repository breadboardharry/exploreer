import { useManifest } from "@hooks/use-manifest";
import { useSelection, UseSelectionResult } from "@hooks/use-selection";
import { FileItem, FileItemWithMetadata, getFiles } from "@lib/file/file";
import { filterFiles, FilterState } from "@lib/file/filter";
import { FileMetadata, MANIFEST_FILE_NAME } from "@lib/manifest/manifest";
import { Tag } from "@lib/tag/tag";
import { dirname, join } from "@tauri-apps/api/path";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { remove, rename, writeTextFile } from "@tauri-apps/plugin-fs";
import { createContext, ReactNode, useEffect, useState } from "react";

export interface ExplorerContextType {
  directory: string | null;
  setDirectory: (path: string | null) => void;
  filteredFiles: FileItemWithMetadata[];
  selection: UseSelectionResult;
  filters: FilterState;
  setFilters: (
    filter: FilterState | ((prev: FilterState) => FilterState),
  ) => void;
  manifest: ReturnType<typeof useManifest>;
  startFromZero: () => Promise<void>;
  tags: Tag[];
  loading: boolean;
  // Méthodes pour les actions sur les tags
  addTag: (tagName: string, color: string) => void;
  getTagColor: (tagName: string) => string;
  renameTag: (oldName: string, newName: string) => void;
  changeTagColor: (tagName: string, color: string) => void;
  deleteTag: (tagName: string) => void;
  getTagUseCount: (tagName: string) => number;
  // Méthodes pour les actions sur les fichiers
  toggleFileTag: (file: FileItem, tagName: string) => Promise<void>;
  addFileTags: (file: FileItem, tags: string[]) => Promise<void>;
  removeFileTags: (file: FileItem, tags: string[]) => Promise<void>;
  renameFile: (file: FileItem, newName: string) => Promise<void>;
  deleteFile: (file: FileItem) => Promise<void>;
  deleteFiles: (files: FileItem[]) => Promise<void>;
  // Autres méthodes
  refreshDirectory: () => Promise<void>;
}

export const ExplorerContext = createContext<ExplorerContextType | undefined>(
  undefined,
);

interface ExplorerProviderProps {
  children: ReactNode;
}
const ExplorerProvider: React.FC<ExplorerProviderProps> = ({ children }) => {
  const [directory, setDirectory] = useState<string | null>(null);
  // Fichiers trouvés dans le dossier, sans filtrage
  const [files, setFiles] = useState<FileItem[]>([]);
  // Fichiers après application des filtres (catégorie, taille, tags, recherche)
  const [filteredFiles, setFilteredFiles] = useState<FileItemWithMetadata[]>(
    [],
  );
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    size: undefined,
    tags: {
      mode: "contains-all",
      values: [],
    },
  });
  const [tagArray, setTagArray] = useState<Tag[]>([]);
  const selection = useSelection(filteredFiles, (file) => file.path);
  const manifest = useManifest();
  const [loading, setLoading] = useState(true);

  // Charger les fichiers du dossier sélectionné
  useEffect(() => {
    if (!directory) return;
    loadDirectory(directory);
  }, [directory]);

  useEffect(() => {
    setTagArray(
      Object.entries(manifest.tags).map(([name, { color }]) => ({
        name,
        color,
      })),
    );
  }, [manifest.tags]);

  useEffect(() => {
    const filesWithMetadata = mergeMetadata(files, manifest.files);
    const filtered = filterFiles(filesWithMetadata, filters);
    setFilteredFiles(filtered);
  }, [filters, files, manifest.files, manifest.tags]);

  // Gestion de l'écriture du manifest à chaque changement de métadonnées (ex: tags)
  useEffect(() => {
    const timer = setTimeout(() => {
      const saveManifest = async () => {
        if (!directory) return;

        console.log("Manifest mis à jour, sauvegarde en cours...");
        try {
          const path = await join(directory, MANIFEST_FILE_NAME);
          writeTextFile(path, manifest.serialize());
        } catch (error) {
          console.error("Erreur lors de la sauvegarde du manifest :", error);
        }
      };
      saveManifest();
    }, 1000); // Délai de 1 seconde pour éviter les écritures trop fréquentes

    // Si changements AVANT que la seconde ne soit écoulée,
    // React va d'abord exécuter ce 'return', ce qui va détruire le timer précédent.
    // Puis il relancera le useEffect depuis le début.
    return () => {
      clearTimeout(timer);
    };
  }, [manifest.version, manifest.files, manifest.tags]);

  // Gestion du titre de la fenêtre avec le chemin du dossier
  useEffect(() => {
    const appWindow = getCurrentWindow();
    // On change le titre avec le chemin du dossier
    appWindow.setTitle(
      directory ? `Explorateur - ${directory}` : "Mon App Tauri",
    );

    // Fonction de nettoyage : on remet le titre d'origine quand on quitte
    return () => {
      appWindow.setTitle("Mon App Tauri");
    };
  }, [directory]);

  const loadDirectory = async (directory: string) => {
    console.log("Chargement du répertoire :", directory);
    setLoading(true);

    try {
      const diskFiles = await getFiles(directory);

      const manifestFile = diskFiles.find(
        (file) => file.name === MANIFEST_FILE_NAME,
      );
      if (manifestFile) {
        manifest.load(manifestFile.path);
      } else {
        manifest.reset();
        manifest.setFiles(
          Object.fromEntries(
            diskFiles.map((file) => [file.name, { tags: [] }]),
          ),
        );

        // Ecrire un nouveau fichier de base avec la structure minimale
        await writeTextFile(
          await join(directory, MANIFEST_FILE_NAME),
          manifest.serialize(),
        );
      }

      setFiles(diskFiles);
    } catch (error) {
      console.error("Erreur de lecture :", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshDirectory = async () => {
    if (!directory) return;
    await loadDirectory(directory);
  };

  const startFromZero = async () => {
    if (!directory) return;
    try {
      // Supprilmer le manifest du disque
      await remove(await join(directory, MANIFEST_FILE_NAME));
      // Recharger le répertoire, ce qui va recréer un manifest vierge
      await loadDirectory(directory);
    } catch (error) {
      console.error("Erreur lors du reset du manifest :", error);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                    TAGS                                    */
  /* -------------------------------------------------------------------------- */

  const getTagColor = (tagName: string): string => {
    const tag = manifest.tags[tagName];
    return tag ? tag.color : "gray";
  };

  const toggleFileTag = async (file: FileItem, tagName: string) => {
    manifest.toggleFileTag(file.name, tagName);
  };

  const addTag = (tagName: string, color: string) => {
    manifest.setTags((prev) => ({
      ...prev,
      [tagName]: { color },
    }));
  };

  const addFileTags = async (file: FileItem, tags: string[]) => {
    manifest.addFileTags(file.name, tags);
  };

  const removeFileTags = async (file: FileItem, tags: string[]) => {
    manifest.removeFileTags(file.name, tags);
  };

  const renameTag = (oldName: string, newName: string) => {
    manifest.renameTag(oldName, newName);
  };

  const changeTagColor = (tagName: string, color: string) => {
    manifest.changeTagColor(tagName, color);
  };

  const deleteTag = (tagName: string) => {
    manifest.deleteTag(tagName);
  };

  const getTagUseCount = (tagName: string) => {
    return manifest.getTagUseCount(tagName);
  };

  /* -------------------------------------------------------------------------- */
  /*                                    FILE                                    */
  /* -------------------------------------------------------------------------- */

  const renameFile = async (file: FileItem, newName: string) => {
    // Éviter les opérations inutiles
    if (!newName || newName === file.name) return;

    try {
      // 1. Obtenir le dossier parent du fichier actuel
      const dirPath = await dirname(file.path);

      // 2. Construire le futur chemin avec le nouveau nom
      const newPath = await join(dirPath, newName);

      // 3. Renommer sur le disque
      await rename(file.path, newPath);

      // 4. Mettre à jour l'interface React sans avoir à recharger tout le dossier
      setFiles((prevFiles) =>
        prevFiles.map((f) => {
          if (f.path === file.path) {
            return { ...f, name: newName, path: newPath }; // On met à jour le nom ET le chemin !
          }
          return f;
        }),
      );
      manifest.renameFile(file.name, newName);
    } catch (error) {
      console.error("Erreur lors du renommage :", error);
    }
  };

  const deleteFile = async (file: FileItem) => {
    try {
      // 1. Supprimer le fichier sur le disque
      await remove(file.path);

      // 2. Mettre à jour l'interface React en retirant le fichier de la liste
      setFiles((prevFiles) => prevFiles.filter((f) => f.path !== file.path));
      manifest.deleteFile(file.name);
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      // Ici tu pourrais afficher une notification d'erreur (ex: fichier verrouillé par un autre programme)
    }
  };

  const deleteFiles = async (files: FileItem[]) => {
    try {
      // On lance toutes les suppressions en parallèle
      await Promise.all(files.map((file) => remove(file.path)));

      // On nettoie l'interface
      setFiles((prev) => prev.filter((f) => !files.includes(f)));
      manifest.deleteFiles(files.map((f) => f.name));
    } catch (error) {
      console.error("Erreur lors de la suppression groupée :", error);
    }
  };

  /**
   * Fusionne les métadonnées du manifest avec les fichiers du dossier pour obtenir une liste de FileItem enrichie avec les tags
   * @param files La liste de fichiers du dossier
   * @param fileManifest Le manifest contenant les métadonnées (tags) des fichiers
   * @returns Une nouvelle liste de FileItem avec les tags intégrés
   */
  const mergeMetadata = (
    files: FileItem[],
    fileManifest: Record<string, FileMetadata>,
  ): FileItemWithMetadata[] => {
    return files.map((file) => ({
      ...file,
      tags: fileManifest[file.name]?.tags || [],
    }));
  };

  return (
    <ExplorerContext.Provider
      value={{
        directory,
        setDirectory,
        filteredFiles,
        filters,
        setFilters,
        tags: tagArray,
        selection,
        manifest,
        loading,
        startFromZero,
        // Méthodes pour les actions sur les tags
        addTag,
        getTagUseCount,
        renameTag,
        changeTagColor,
        deleteTag,
        // Méthodes pour les actions sur les fichiers (ex: supprimer, renommer, etc.)
        toggleFileTag,
        addFileTags,
        removeFileTags,
        getTagColor,
        renameFile,
        deleteFile,
        deleteFiles,
        // Autres méthodes
        refreshDirectory,
      }}
    >
      {children}
    </ExplorerContext.Provider>
  );
};

export default ExplorerProvider;
