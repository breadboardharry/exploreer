import useExplorer from "@hooks/use-explorer";
import usePreference from "@hooks/use-preference";
import { ask } from "@tauri-apps/plugin-dialog";
import { DetailsPanel } from "@view/common/details-panel";
import ExplorerHeader from "@view/common/explorer-header";
import FileCard from "@view/common/file-card";
import { FileContextMenu } from "@view/common/file-context-menu";
import { FileViewer } from "@view/common/file-viewer";
import { SelectionBar } from "@view/common/selection-bar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@view/ui/resizable";
import React, { useRef, useState } from "react";

export type ViewMode = "grid" | "list";

interface ExplorerProps {}

const Explorer: React.FC<ExplorerProps> = () => {
  const { showTags, showDetails, setShowDetails } = usePreference();
  const { filteredFiles, filters, loading, deleteFiles, selection } =
    useExplorer();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [viewingIndex, setViewingIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);

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

  const getColumnCount = () => {
    if (viewMode === "list") return 1;

    const container = containerRef.current;
    if (!container || container.children.length === 0) return 1;

    const children = container.children;
    const firstY = (children[0] as HTMLElement).offsetTop;

    // On cherche le premier élément qui est "plus bas" que le premier
    for (let i = 1; i < children.length; i++) {
      if ((children[i] as HTMLElement).offsetTop > firstY) {
        return i; // L'index correspond au nombre exact de colonnes !
      }
    }

    // Si tout tient sur une seule ligne
    return children.length;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // On ignore les touches si l'utilisateur est en train de taper dans un input (ex: barre de recherche)
    if (
      document.activeElement?.tagName === "INPUT" ||
      document.activeElement?.tagName === "TEXTAREA"
    )
      return;

    const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    if (!keys.includes(e.key)) return;

    e.preventDefault(); // Empêche la page entière de scroller quand on utilise les flèches

    // On trouve l'index de départ (le fichier actuellement sélectionné)
    let currentIndex = 0;
    if (selection.selectedKeys.size > 0) {
      // On prend le premier fichier sélectionné comme point de départ
      const firstSelectedPath = Array.from(selection.selectedKeys)[0];
      currentIndex = filteredFiles.findIndex(
        (f) => f.path === firstSelectedPath,
      );
    }

    const columns = getColumnCount();
    let nextIndex = currentIndex;

    // Calcul du prochain index selon la touche
    if (e.key === "ArrowRight") nextIndex = currentIndex + 1;
    if (e.key === "ArrowLeft") nextIndex = currentIndex - 1;
    if (e.key === "ArrowDown") nextIndex = currentIndex + columns;
    if (e.key === "ArrowUp") nextIndex = currentIndex - columns;

    // Sécurité : On ne déborde pas du tableau
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= filteredFiles.length) nextIndex = filteredFiles.length - 1;

    // Si l'index a changé, on met à jour la sélection
    if (nextIndex !== currentIndex) {
      // Optionnel : Gestion de la touche Shift pour la sélection multiple au clavier
      if (e.shiftKey) {
        selection.toggle(nextIndex, false, true);
      } else {
        // Navigation normale : on efface et on sélectionne le nouveau
        selection.clear();
        selection.toggle(nextIndex, false, false);
      }

      // UX : On scroll automatiquement pour que le fichier reste visible
      const nextElement = containerRef.current?.children[
        nextIndex
      ] as HTMLElement;
      if (nextElement) {
        nextElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
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

      <ExplorerHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showSidebar={showDetails}
        onToggleSidebar={() => setShowDetails((prev) => !prev)}
      />

      {/* --- ZONE PRINCIPALE --- */}
      <main
        className={`flex-1 ${isViewerOpen ? "overflow-hidden" : "overflow-y-auto"}`}
      >
        <ResizablePanelGroup orientation="horizontal" className="w-full">
          <ResizablePanel defaultSize="75%" className="p-6 xl:p-8">
            {loading ? (
              /* ------------------------------- CHARGEMENT ------------------------------- */
              <div className="flex p-6 md:p-8 justify-center items-center h-full text-slate-400">
                <div className="animate-pulse flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                  Chargement des fichiers...
                </div>
              </div>
            ) : filteredFiles.length === 0 ? (
              /* ----------------------------- AUCUN RÉSULTAT ----------------------------- */
              <div className="flex p-6 md:p-8 flex-col items-center justify-center h-full text-slate-400 gap-4">
                {/* Message adapté si la recherche ne donne rien */}
                <p>
                  {filters.query
                    ? `Aucun fichier ne correspond à "${filters.query}"`
                    : "Aucun fichier trouvé."}
                </p>
              </div>
            ) : (
              /* -------------------------------- RÉSULTATS ------------------------------- */
              <div
                ref={containerRef}
                // Permet à la div de capturer les touches du clavier
                tabIndex={0}
                // On attache l'écouteur d'événements
                onKeyDown={handleKeyDown}
                className={
                  "outline-none focus:ring-0 " +
                  (viewMode === "grid"
                    ? "grid gap-6 grid-cols-[repeat(auto-fill,minmax(140px,1fr))]"
                    : "flex flex-col gap-2")
                }
                onClick={selection.clear}
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
          </ResizablePanel>

          {showDetails && (
            <>
              <ResizableHandle />
              <ResizablePanel
                defaultSize="25%"
                minSize="240px"
                maxSize="50%"
                // Permet à la div de capturer les touches du clavier
                tabIndex={0}
                // On attache l'écouteur d'événements
                onKeyDown={handleKeyDown}
              >
                <DetailsPanel />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
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
