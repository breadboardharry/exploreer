import { FileItem, filterFiles, FilterState, getFiles } from "@lib/file/file";
import { getCurrentWindow } from "@tauri-apps/api/window";
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
  loading: boolean;
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
  const [loading, setLoading] = useState(true);

  // Charger les fichiers du dossier sélectionné
  useEffect(() => {
    if (!directory) return;

    const loadFiles = async () => {
      setLoading(true);
      try {
        const formattedFiles = await getFiles(directory);
        setFiles(formattedFiles);
      } catch (error) {
        console.error("Erreur de lecture :", error);
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
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

  return (
    <ExplorerContext.Provider
      value={{
        directory,
        setDirectory,
        files,
        filteredFiles,
        filters,
        setFilters,
        loading,
      }}
    >
      {children}
    </ExplorerContext.Provider>
  );
};

export default ExplorerProvider;
