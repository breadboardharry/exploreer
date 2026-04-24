import { join } from "@tauri-apps/api/path";
import { readDir, stat } from "@tauri-apps/plugin-fs";
import React, { useEffect, useState } from "react";
import { MdArrowBack, MdFormatListBulleted, MdGridView } from "react-icons/md";
import FileCard from "../common/file-card";

interface FileItem {
  name: string;
  size: string;
  date: string;
  path: string;
}

interface ExplorerProps {
  folderPath: string;
  onBack: () => void;
}

const Explorer: React.FC<ExplorerProps> = ({ folderPath, onBack }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  // Utilitaire pour la taille (simulée ici car readDir ne donne pas la taille par défaut)
  const formatSize = (bytes: number | undefined) => {
    if (!bytes) return "--";
    const units = ["o", "Ko", "Mo", "Go"];
    let l = 0,
      n = bytes || 0;
    while (n >= 1024 && ++l) n = n / 1024;
    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + " " + units[l];
  };

  useEffect(() => {
    const loadFiles = async () => {
      setLoading(true);
      try {
        const entries = await readDir(folderPath);
        const fileEntries = entries.filter((entry) => entry.isFile);

        // On utilise Promise.all car la fonction join() de Tauri est asynchrone
        const formattedFiles: FileItem[] = await Promise.all(
          fileEntries.map(async (entry) => {
            // On reconstruit le chemin absolu du fichier
            const fullPath = await join(folderPath, entry.name || "");
            const fileMetadata = await stat(fullPath);

            return {
              name: entry.name || "Inconnu",
              size: formatSize(fileMetadata.size),
              date: "Récemment",
              path: fullPath, // <-- On passe le chemin au composant
            };
          }),
        );

        setFiles(formattedFiles);
      } catch (error) {
        console.error("Erreur de lecture :", error);
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [folderPath]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-700 font-sans">
      {/* --- EN-TÊTE --- */}
      <header className="flex justify-between items-center p-4 md:px-8 bg-white border-b border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-6">
          <button
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
            onClick={onBack}
            title="Retour à l'accueil"
          >
            <MdArrowBack className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Dossier :
            </span>
            <span className="text-sm font-mono text-slate-700">
              {folderPath}
            </span>
          </div>
        </div>

        {/* Contrôles de vue (Grille / Liste) */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            className={`p-1.5 rounded-md transition-all flex items-center justify-center ${viewMode === "grid" ? "bg-white text-blue-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            onClick={() => setViewMode("grid")}
            title="Vue Grille"
          >
            <MdGridView className="w-5 h-5" />
          </button>
          <button
            className={`p-1.5 rounded-md transition-all flex items-center justify-center ${viewMode === "list" ? "bg-white text-blue-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            onClick={() => setViewMode("list")}
            title="Vue Liste"
          >
            <MdFormatListBulleted className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* --- ZONE PRINCIPALE --- */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full text-slate-400">
            <div className="animate-pulse flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
              Chargement des fichiers...
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
            <svg
              className="w-16 h-16 text-slate-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <polyline points="13 2 13 9 20 9" />
            </svg>
            <p>Aucun fichier trouvé dans ce dossier.</p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-6 grid-cols-[repeat(auto-fill,minmax(140px,1fr))]"
                : "flex flex-col gap-2"
            }
          >
            {/* On délègue l'affichage de chaque fichier au composant FileCard */}
            {files.map((file, index) => (
              <FileCard
                key={index}
                file={file}
                viewMode={viewMode}
                onClick={() => console.log(`Clic sur ${file.name}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Explorer;
