import useExplorer from "@hooks/use-explorer";
import usePreference from "@hooks/use-preference";
import { ask } from "@tauri-apps/plugin-dialog";
import ExplorerHeader from "@view/common/explorer-header";
import { FileContextMenu } from "@view/common/file-context-menu";
import { FileViewer } from "@view/common/file-viewer";
import { SelectionBar } from "@view/common/selection-bar";
import React, { useState } from "react";
import FileCard from "../common/file-card";

export type ViewMode = "grid" | "list";

interface ExplorerProps {}

const Explorer: React.FC<ExplorerProps> = () => {
  const { filteredFiles, filters, loading, deleteFiles, selection } =
    useExplorer();
  const { showTags } = usePreference();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [viewingIndex, setViewingIndex] = useState<number>(-1);

  const isViewerOpen = viewingIndex !== -1;
  const selectedCount = selection.selectedKeys.size;

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

  const handleBulkDelete = async () => {
    try {
      const confirmed = await ask(
        `Voulez-vous vraiment supprimer ces ${selectedCount} éléments ?`,
        { title: "Suppression groupée", kind: "warning" },
      );

      if (confirmed) {
        // On récupère les fichiers sélectionnés
        const filesToDelete = filteredFiles.filter((f) =>
          selection.selectedKeys.has(f.path),
        );

        await deleteFiles(filesToDelete);

        selection.clear();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression groupée :", error);
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
        onClick={selection.clear}
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
            {filteredFiles.map((file, index) => (
              <FileContextMenu
                key={file.path}
                file={file}
                trigger={() => (
                  <FileCard
                    key={file.path}
                    file={file}
                    searchQuery={filters.query}
                    viewMode={viewMode}
                    isSelected={selection.selectedKeys.has(file.path)}
                    showTags={showTags}
                    onClick={(e) => {
                      e.stopPropagation(); // Empêche le clearSelection du <main>
                      // e.metaKey sert pour les utilisateurs Mac (Touche Cmd)
                      selection.toggle(
                        index,
                        e.ctrlKey || e.metaKey,
                        e.shiftKey,
                      );
                    }}
                    onDoubleClick={() =>
                      setViewingIndex(filteredFiles.indexOf(file))
                    }
                  />
                )}
              ></FileContextMenu>
            ))}
          </div>
        )}
      </main>

      <SelectionBar
        count={selectedCount}
        onClear={selection.clear}
        onDelete={handleBulkDelete}
      />
    </div>
  );
};

export default Explorer;
