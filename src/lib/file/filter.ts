import { FileCategory, FileItemWithMetadata, getFileCategory } from "./file";
import { SizeRangeFilter } from "./size";

export type TagFilterMode =
  // Au moins un des tags doit être présent dans fileTags
  | "contains"
  // Tous les tags doivent être présents dans fileTags
  | "contains-all"
  // Aucun des tags ne doit être présent dans fileTags
  | "excludes"
  // Le tableau de tags doit être vide
  | "empty"
  // Le tableau de tags ne doit pas être vide
  | "not_empty";

export interface FilterState {
  // Un tableau de catégories sélectionnées (ex: ["image", "video"]), ou vide pour "tous"
  categories: FileCategory[];
  size?: SizeRangeFilter | undefined;
  tags: {
    mode: TagFilterMode;
    values: string[];
  };
  query?: string | undefined;
}

/**
 * Applique les filtres de catégorie, taille et recherche textuelle sur une liste de fichiers
 * @param files La liste de fichiers à filtrer
 * @param filter L'état des filtres à appliquer
 * @returns Une nouvelle liste de fichiers qui correspondent aux critères de filtrage
 */
export const filterFiles = (
  files: FileItemWithMetadata[],
  { categories, size, tags, query }: FilterState,
): FileItemWithMetadata[] => {
  return files.filter((file) => {
    const matchesCategory =
      categories.length === 0 ||
      categories.includes(getFileCategory(file.extension));
    const matchesSize = !size || size.contains(file.size);
    const matchesTags = matchTags(file.tags, tags);
    const matchesQuery = !query || file.name.includes(query);

    return matchesCategory && matchesSize && matchesTags && matchesQuery;
  });
};

const matchTags: (
  fileTags: string[],
  filterTags: { mode: TagFilterMode; values: string[] },
) => boolean = (fileTags, { mode, values }) => {
  if (mode === "empty") return fileTags.length === 0;
  if (mode === "not_empty") return fileTags.length > 0;
  if (mode === "excludes")
    return values.every((tag) => !fileTags.includes(tag));

  // Mode "contains"
  if (values.length === 0) return true; // Si aucun tag n'est sélectionné, on considère que tous les fichiers correspondent

  // Si le mode est "contains-all", tous les tags doivent être présents dans fileTags
  if (mode === "contains-all")
    return values.every((tag) => fileTags.includes(tag));
  // Si le mode est "contains", au moins un des tags doit être présent dans fileTags
  return values.some((tag) => fileTags.includes(tag));
};
