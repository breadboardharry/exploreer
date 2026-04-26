import { useSelection, UseSelectionResult } from "@hooks/use-selection";
import {
  DATABASE_FILE_NAME,
  DatabaseFileContent,
  FileMetadata,
  parseDatabaseFile,
} from "@lib/database/database";
import { FileItem, filterFiles, FilterState, getFiles } from "@lib/file/file";
import { dirname, join } from "@tauri-apps/api/path";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { remove, rename } from "@tauri-apps/plugin-fs";
import { createContext, ReactNode, useEffect, useState } from "react";

export interface ExplorerContextType {
  directory: string | null;
  setDirectory: (path: string | null) => void;
  files: FileItem[];
  filteredFiles: FileItem[];
  filters: FilterState;
  setFilters: (
    filter: FilterState | ((prev: FilterState) => FilterState),
  ) => void;
  manifest: Record<string, FileMetadata> | null;
  loading: boolean;
  selection: UseSelectionResult;
  // Méthodes pour les actions sur les fichiers (ex: supprimer, renommer, etc.)
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
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    size: undefined,
  });
  const selection = useSelection(filteredFiles, (file) => file.path);
  const [database, setDatabase] = useState<DatabaseFileContent | null>(null);
  const [manifest, setManifest] = useState<Record<string, FileMetadata>>({});
  const [loading, setLoading] = useState(true);

  // Charger les fichiers du dossier sélectionné
  useEffect(() => {
    if (!directory) return;

    loadDirectory(directory);
  }, [directory]);

  useEffect(() => {
    const filtered = filterFiles(files, filters);
    setFilteredFiles(filtered);
  }, [files, filters]);

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
    const loadFiles = async () => {
      setLoading(true);
      try {
        const formattedFiles = await getFiles(directory);

        const databaseFile = formattedFiles.find(
          (file) => file.name === DATABASE_FILE_NAME,
        );
        if (databaseFile) {
          const content = await parseDatabaseFile(databaseFile.path);
          setDatabase(content);
          setManifest(content.manifest);
        } else {
          // Définir des metadata par défaut pour tous les fichiers si aucun manifest n'est trouvé
          setManifest(
            Object.fromEntries(
              formattedFiles.map((file) => [file.name, { tags: [] }]),
            ),
          );
        }

        setFiles(formattedFiles);
      } catch (error) {
        console.error("Erreur de lecture :", error);
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  };

  const refreshDirectory = async () => {
    if (!directory) return;
    await loadDirectory(directory);
  };

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
      setManifest((prev) => {
        const metadata = { ...prev[file.name] };
        const updated = { ...prev };
        delete updated[file.name];
        updated[newName] = metadata;
        return updated;
      });
    } catch (error) {
      console.error("Erreur lors du renommage :", error);
    }
  };

  const deleteFile = async (file: FileItem) => {
    try {
      // 2. Supprimer le fichier sur le disque
      await remove(file.path);

      // 3. Mettre à jour l'interface React en retirant le fichier de la liste
      setFiles((prevFiles) => prevFiles.filter((f) => f.path !== file.path));
      setManifest((prev) => {
        const updated = { ...prev };
        delete updated[file.name];
        return updated;
      });
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
      setManifest((prev) => {
        const updated = { ...prev };
        files.forEach((file) => delete updated[file.name]);
        return updated;
      });
    } catch (error) {
      console.error("Erreur lors de la suppression groupée :", error);
    }
  };

  return (
    <ExplorerContext.Provider
      value={{
        directory,
        setDirectory,
        files,
        filteredFiles,
        filters,
        setFilters,
        manifest,
        loading,
        selection,
        // Méthodes pour les actions sur les fichiers (ex: supprimer, renommer, etc.)
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
