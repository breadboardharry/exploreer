import useExplorer from "@hooks/use-explorer";
import { FileItemWithMetadata } from "@lib/file/file";
import { formatSize } from "@lib/utils/file.utils";
import { useEffect, useState } from "react";
import { FilePreview } from "./file-preview";
import { TagBadge } from "./tag-badge";

export const DetailsPanel: React.FC = () => {
  const {
    filteredFiles,
    filters,
    directory,
    selection,
    getTagColor,
    removeFileTags,
  } = useExplorer();
  const [selectedFiles, setSelectedFiles] = useState<FileItemWithMetadata[]>(
    [],
  );

  useEffect(() => {
    const selected = filteredFiles.filter((f) =>
      selection.selectedKeys.has(f.path),
    );
    console.log("Fichiers sélectionnés mis à jour :", selected);
    setSelectedFiles(selected);
  }, [selection.selectedKeys, filteredFiles]);

  const handleRemoveTag = (file: FileItemWithMetadata, tag: string) => {
    removeFileTags(file, [tag]);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {selectedFiles.length === 0 ? (
        /* ------------------------ AUCUN FICHIER SÉLECTIONNÉ ----------------------- */
        filters.query?.trim() ? (
          // SI UNE RECHERCHE EST ACTIVE, AFFICHER UN MESSAGE "Aucun résultat"
          <>
            <div className="w-full h-[35dvh] flex items-center justify-center bg-slate-200"></div>

            <h2 className="w-full px-4 mt-5 mb-4 font-medium line-clamp-2 break-all">
              {`"${filters.query}" (${filteredFiles.length} éléments)`}
            </h2>
          </>
        ) : (
          // PAR DÉFAUT, NOM DU RÉPERTOIRE + NOMBRE D'ÉLÉMENTS
          <>
            <div className="w-full h-[35dvh] flex items-center justify-center bg-slate-200"></div>

            <h2 className="w-full px-4 mt-5 mb-4 font-medium line-clamp-2 break-all">
              {`${directory} (${filteredFiles.length} éléments)`}
            </h2>
          </>
        )
      ) : selectedFiles.length === 1 ? (
        /* ----------------------- UN SEUL FICHIER SÉLECTIONNÉ ---------------------- */
        <>
          <div className="w-full h-[35dvh] flex items-center justify-center bg-slate-200">
            <FilePreview
              path={selectedFiles[0].path}
              name={selectedFiles[0].name}
              className="aspect-square max-h-[35dvh]"
            />
          </div>

          <h1 className="w-full px-4 mt-5 mb-4 text-center text-lg font-semibold line-clamp-2 break-all">
            {selectedFiles[0].name}
          </h1>

          <div className="w-full px-4 my-2 flex flex-col">
            <h3 className="w-full mb-2 text-sm font-medium">Détails</h3>

            <ul>
              <li className="flex items-center justify-between text-sm text-slate-500">
                <span>Taille</span>
                <span>{formatSize(selectedFiles[0].size)}</span>
              </li>
            </ul>
          </div>

          <div className="w-full px-4 my-2 flex flex-col flex-1">
            <h3 className="w-full mb-2 text-sm font-medium">Tags</h3>

            {selectedFiles[0].tags.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {selectedFiles[0].tags.map((tag) => (
                  <li
                    key={tag}
                    className="flex items-center justify-between text-sm text-slate-500"
                  >
                    <TagBadge
                      name={tag}
                      color={getTagColor(tag)}
                      showRemove
                      onRemove={() => handleRemoveTag(selectedFiles[0], tag)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-sm text-slate-500">Aucun</span>
            )}
          </div>
        </>
      ) : (
        /* --------------------- PLUSIEURS FICHIERS SÉLECTIONNÉS -------------------- */
        <>
          <div className="w-full h-[35dvh] flex items-center justify-center bg-slate-200">
            <span className="text-6xl text-slate-400 font-semibold">
              {selectedFiles.length}
            </span>
          </div>

          <h2 className="w-full px-4 mt-5 mb-4 font-medium line-clamp-2 break-all">
            {selectedFiles.length} fichiers sélectionnés
          </h2>
        </>
      )}
    </div>
  );
};
