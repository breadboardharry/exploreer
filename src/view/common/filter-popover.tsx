import useExplorer from "@hooks/use-explorer";
import { FileCategory } from "@lib/file/file";
import { FilterState, TagFilterMode } from "@lib/file/filter";
import {
  LargeSizeRange,
  MediumSizeRange,
  SizeRangeFilter,
  SmallSizeRange,
} from "@lib/file/size";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@view/ui/popover";
import React from "react";
import {
  MdAudioFile,
  MdCode,
  MdDescription,
  MdImage,
  MdVideoLibrary,
} from "react-icons/md";
import { TagBadge } from "./tag-badge";

interface FilterPopoverProps {
  trigger?: (props: {
    // Si les filtres sont à leur état par défaut (aucune catégorie, aucune taille)
    isDefault: boolean;
  }) => React.ReactElement;
  filters: Pick<FilterState, "categories" | "size" | "tags">;
  onFilterChange: (newFilters: FilterState) => void;
}
const FilterPopover: React.FC<FilterPopoverProps> = ({
  trigger,
  filters,
  onFilterChange,
}) => {
  const { tags } = useExplorer();

  // Petites fonctions utilitaires pour rendre le JSX plus propre
  const updateCategory = (categories: FileCategory[]) =>
    onFilterChange({ ...filters, categories });
  const updateSize = (size: SizeRangeFilter | undefined) =>
    onFilterChange({ ...filters, size });
  const updateTagMode = (mode: FilterState["tags"]["mode"]) =>
    onFilterChange({ ...filters, tags: { ...filters.tags, mode } });
  const toggleTagSelection = (tagName: string) => {
    const values = filters.tags.values.includes(tagName)
      ? filters.tags.values.filter((t) => t !== tagName)
      : [...filters.tags.values, tagName];
    onFilterChange({ ...filters, tags: { ...filters.tags, values } });
  };
  const resetFilters = () =>
    onFilterChange({
      categories: [],
      size: undefined,
      tags: { mode: "contains", values: [] },
    });

  // Classes communes pour nos boutons de filtres (effet pilule)
  const basePillClass =
    "flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200";
  const activePillClass =
    "bg-blue-50 border-blue-200 text-blue-700 font-medium";
  const inactivePillClass =
    "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300";

  const isDefaultState =
    filters.categories.length === 0 &&
    !filters.size &&
    filters.tags.mode === "contains" &&
    filters.tags.values.length === 0;

  return (
    <Popover>
      <PopoverTrigger
        render={trigger?.({
          isDefault: isDefaultState,
        })}
      />
      <PopoverContent className="w-80 p-0 shadow-xl border-slate-200 rounded-xl">
        <PopoverHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <PopoverTitle className="text-sm font-semibold text-slate-800">
              Filtrer les fichiers
            </PopoverTitle>

            {/* Bouton pour tout réinitialiser rapidement */}
            {!isDefaultState && (
              <button
                onClick={resetFilters}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Réinitialiser
              </button>
            )}
          </div>
          <PopoverDescription className="text-xs text-slate-500 mt-1">
            Affinez l'affichage de votre dossier actuel.
          </PopoverDescription>
        </PopoverHeader>

        <div className="p-4 pt-1.5 flex flex-col gap-6">
          {/* --- SECTION 1 : CATÉGORIES --- */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Type de fichier
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateCategory([])}
                className={`${basePillClass} ${filters.categories.length === 0 ? activePillClass : inactivePillClass}`}
              >
                Tous
              </button>
              <button
                onClick={() => updateCategory(["image"])}
                className={`${basePillClass} ${filters.categories.includes("image") ? activePillClass : inactivePillClass}`}
              >
                <MdImage className="w-4 h-4" /> Images
              </button>
              <button
                onClick={() => updateCategory(["document"])}
                className={`${basePillClass} ${filters.categories.includes("document") ? activePillClass : inactivePillClass}`}
              >
                <MdDescription className="w-4 h-4" /> Documents
              </button>
              <button
                onClick={() => updateCategory(["video"])}
                className={`${basePillClass} ${filters.categories.includes("video") ? activePillClass : inactivePillClass}`}
              >
                <MdVideoLibrary className="w-4 h-4" /> Vidéos
              </button>
              <button
                onClick={() => updateCategory(["audio"])}
                className={`${basePillClass} ${filters.categories.includes("audio") ? activePillClass : inactivePillClass}`}
              >
                <MdAudioFile className="w-4 h-4" /> Audio
              </button>
              <button
                onClick={() => updateCategory(["code"])}
                className={`${basePillClass} ${filters.categories.includes("code") ? activePillClass : inactivePillClass}`}
              >
                <MdCode className="w-4 h-4" /> Code
              </button>
            </div>
          </div>

          {/* --- SECTION 2 : TAILLE --- */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Taille du fichier
            </h3>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="size"
                  checked={!filters.size}
                  onChange={() => updateSize(undefined)}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900">
                  Peu importe
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="size"
                  checked={filters.size?.id === "small"}
                  onChange={() => updateSize(SmallSizeRange)}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900">
                  Petit{" "}
                  <span className="text-slate-400 text-xs">
                    (Moins de 1 Mo)
                  </span>
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="size"
                  checked={filters.size?.id === "medium"}
                  onChange={() => updateSize(MediumSizeRange)}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900">
                  Moyen{" "}
                  <span className="text-slate-400 text-xs">
                    (1 Mo à 100 Mo)
                  </span>
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="size"
                  checked={filters.size?.id === "large"}
                  onChange={() => updateSize(LargeSizeRange)}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900">
                  Grand{" "}
                  <span className="text-slate-400 text-xs">
                    (Plus de 100 Mo)
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* --- SECTION 3 : TAGS --- */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Tags
            </h3>

            <select
              value={filters.tags.mode}
              onChange={(e) => updateTagMode(e.target.value as TagFilterMode)}
              className="w-full mb-3 p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="contains-all">Contient tous les tags</option>
              <option value="contains">Contient au moins un des tags</option>
              <option value="excludes">Ne contient pas les tags</option>
              <option value="empty">Sans aucun tag (Vide)</option>
              <option value="not-empty">Possède des tags (Pas vide)</option>
            </select>

            {/* Liste des tags (affichée seulement si mode != vide/pas vide) */}
            {(filters.tags.mode === "contains-all" ||
              filters.tags.mode === "contains" ||
              filters.tags.mode === "excludes") && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <TagBadge
                    key={tag.name}
                    name={tag.name}
                    color={tag.color}
                    clickable={true}
                    onClick={() => toggleTagSelection(tag.name)}
                    className={
                      filters.tags.values.includes(tag.name) ? "" : "opacity-50"
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FilterPopover;
