import useExplorer from "@hooks/use-explorer";
import useHistory from "@hooks/use-history";
import { cn } from "@lib/utils/style.utils";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-dialog";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@view/ui/menubar";
import React from "react";
import { LuFolder } from "react-icons/lu";
import {
  MdFilterList,
  MdFormatListBulleted,
  MdGridView,
  MdSearch,
} from "react-icons/md";
import FilterPopover from "./filter-popover";

export type ViewMode = "grid" | "list";

interface ExplorerHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ExplorerHeader: React.FC<ExplorerHeaderProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  const { history, push: pushToHistory } = useHistory();
  const {
    setDirectory,
    filters,
    setFilters,
    refreshDirectory,
    selection,
    ...explorer
  } = useExplorer();

  const handleSelectFolder = async () => {
    console.log(
      "Ouverture de la boîte de dialogue pour sélectionner un dossier...",
    );
    try {
      const selectedPath = await open({
        directory: true,
        multiple: false,
        title: "Sélectionner un dossier à explorer",
      });

      if (selectedPath) {
        setDirectory(selectedPath);
        pushToHistory(selectedPath);
      }
    } catch (error) {
      console.error(
        "Erreur lors de l'ouverture de la boîte de dialogue :",
        error,
      );
    }
  };

  const handleCloseApp = async () => {
    const window = getCurrentWindow();
    await window.close();
  };

  const handleRefreshDirectory = () => {
    refreshDirectory();
  };

  const triggerStyle =
    "px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded transition-colors focus:outline-none focus:bg-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent";

  return (
    <header className="flex flex-col bg-white shadow-sm shrink-0 z-10 relative">
      {/* NIVEAU 1 : Barre de Menus */}
      <Menubar className="bg-slate-100/80 border-0 border-b border-slate-200 rounded-none gap-1">
        <MenubarMenu>
          <MenubarTrigger className={triggerStyle}>Fichier</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={handleSelectFolder}>
              <LuFolder />
              Ouvrir le dossier
            </MenubarItem>

            <MenubarSub>
              <MenubarSubTrigger disabled={!history.length}>
                Ouvert récemment
              </MenubarSubTrigger>
              <MenubarSubContent>
                {history.map((item, index) => (
                  <MenubarItem
                    key={index}
                    onClick={() => {
                      setDirectory(item);
                      pushToHistory(item);
                    }}
                  >
                    {item}
                  </MenubarItem>
                ))}
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem
              onClick={handleRefreshDirectory}
              disabled={!explorer.directory}
            >
              Recharger
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={handleCloseApp}>Quitter</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className={triggerStyle} disabled>
            Affichage
          </MenubarTrigger>
          <MenubarContent></MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className={triggerStyle} disabled>
            Outils
          </MenubarTrigger>
          <MenubarContent></MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className={triggerStyle}>Debug</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => console.log(explorer.manifest)}>
              Log manifest
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className={triggerStyle} disabled>
            Aide
          </MenubarTrigger>
          <MenubarContent></MenubarContent>
        </MenubarMenu>
      </Menubar>

      {/* NIVEAU 2 : Barre d'outils (Recherche & Vues) */}
      <div className="flex items-center justify-end p-3 px-4 gap-4">
        {/* Barre de recherche */}
        <div className="relative flex-1 max-w-md shrink-0">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher dans ce dossier..."
            value={filters.query || ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, query: e.target.value }))
            }
            className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {filters.query && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, query: "" }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg leading-none"
            >
              &times;
            </button>
          )}
        </div>

        {/* Contrôles de vue */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
          <button
            className={`p-1.5 rounded-md transition-all flex items-center justify-center ${viewMode === "grid" ? "bg-white text-blue-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            onClick={() => onViewModeChange("grid")}
            title="Vue Grille"
          >
            <MdGridView className="w-4 h-4" />
          </button>
          <button
            className={`p-1.5 rounded-md transition-all flex items-center justify-center ${viewMode === "list" ? "bg-white text-blue-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            onClick={() => onViewModeChange("list")}
            title="Vue Liste"
          >
            <MdFormatListBulleted className="w-4 h-4" />
          </button>
        </div>

        <FilterPopover
          trigger={({ isDefault }) => {
            return (
              <button
                className={cn(
                  "p-2 bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 shrink-0",
                  !isDefault &&
                    "text-slate-50 bg-blue-500 hover:text-slate-50 hover:bg-blue-400 cursor-default shadow-[0_0_10px] shadow-blue-500/50",
                )}
                title="Filtrer les fichiers"
              >
                <MdFilterList className="w-5 h-5" />
              </button>
            );
          }}
          filters={filters}
          onFilterChange={(newFilters) => {
            selection.clear();
            setFilters((prev) => ({ ...prev, ...newFilters }));
          }}
        />
      </div>
    </header>
  );
};

export default ExplorerHeader;
