import useExplorer from "@hooks/use-explorer";
import ExplorerHeader from "@view/common/explorer-header";
import { FileViewer } from "@view/common/file-viewer";
import React, { useState } from "react";
import FileCard from "../common/file-card";

export type ViewMode = "grid" | "list";

interface ExplorerProps {}

const Explorer: React.FC<ExplorerProps> = () => {
  const { filteredFiles, filters, loading } = useExplorer();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [viewingIndex, setViewingIndex] = useState<number>(-1);

  const isViewerOpen = viewingIndex !== -1;

  // La logique métier est centralisée ici !
  const handleNextFile = () => {
    if (filteredFiles.length > 0) {
      setViewingIndex((prev) => (prev + 1) % filteredFiles.length);
    }
  };

  const handlePrevFile = () => {
    if (filteredFiles.length > 0) {
      setViewingIndex(
        (prev) => (prev - 1 + filteredFiles.length) % filteredFiles.length,
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-700 font-sans">
      <FileViewer
        isOpen={viewingIndex !== -1}
        file={viewingIndex !== -1 ? filteredFiles[viewingIndex] : null}
        onClose={() => setViewingIndex(-1)}
        // On ne passe les fonctions de navigation que s'il y a plus d'1 fichier !
        onNext={filteredFiles.length > 1 ? handleNextFile : undefined}
        onPrev={filteredFiles.length > 1 ? handlePrevFile : undefined}
        position={{ index: viewingIndex, total: filteredFiles.length }}
      />

      <ExplorerHeader viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* --- ZONE PRINCIPALE --- */}
      <main
        className={`flex-1 p-6 md:p-8 ${isViewerOpen ? "overflow-hidden" : "overflow-y-auto"}`}
      >
        {loading ? (
          <div className="flex justify-center items-center h-full text-slate-400">
            <div className="animate-pulse flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
              Chargement des fichiers...
            </div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
            {/* Message adapté si la recherche ne donne rien */}
            <p>
              {filters.query
                ? `Aucun fichier ne correspond à "${filters.query}"`
                : "Aucun fichier trouvé dans ce dossier."}
            </p>
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
            {filteredFiles.map((file) => (
              <FileCard
                key={file.path}
                file={file}
                searchQuery={filters.query}
                viewMode={viewMode}
                onDoubleClick={() =>
                  setViewingIndex(filteredFiles.indexOf(file))
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Explorer;
