import { FileItem } from "@lib/file/file";
import { formatSize } from "@lib/utils/file.utils";
import { ViewMode } from "@view/pages/explorer.page";
import React from "react";
import { FilePreview } from "./file-preview";
import { HighlightedText } from "./highlighted-text";

interface FileCardProps {
  file: FileItem;
  viewMode: ViewMode;
  searchQuery?: string;
  isSelected?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onDoubleClick?: () => void;
}

const FileCard: React.FC<FileCardProps> = ({
  file,
  viewMode,
  searchQuery = "",
  isSelected,
  onClick,
  onDoubleClick,
}) => {
  // Les classes communes aux deux affichages (effets de survol, fond blanc)
  const baseClasses = `group border cursor-pointer transition-all ${
    isSelected
      ? "bg-blue-100/50 border-blue-400 ring-2 ring-blue-200" // État sélectionné
      : "bg-white border-transparent hover:border-blue-200 hover:bg-slate-50" // État normal
  }`;

  // --- RENDU VUE GRILLE ---
  if (viewMode === "grid") {
    return (
      <div
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={`${baseClasses} flex flex-col items-center text-center p-6 rounded-xl hover:shadow-lg`}
      >
        <div className="mb-4 text-blue-200 group-hover:text-blue-400 transition-colors flex items-center justify-center w-16 h-16">
          <FilePreview
            path={file.path}
            name={file.name}
            className="w-12 h-12"
          />
        </div>
        <div className="w-full">
          <HighlightedText
            text={file.name}
            highlight={searchQuery}
            className="font-medium text-slate-700 text-sm line-clamp-2 break-all px-1 select-none"
          />
        </div>
      </div>
    );
  }

  // --- RENDU VUE LISTE ---
  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`${baseClasses} flex items-center justify-between p-3 px-5 rounded-lg`}
    >
      <div className="mr-4 text-blue-300 flex items-center justify-center w-8 h-8">
        <FilePreview path={file.path} name={file.name} className="w-6 h-6" />
      </div>

      <div className="flex flex-1 items-center justify-between min-w-0">
        <HighlightedText
          text={file.name}
          highlight={searchQuery}
          className="font-medium text-slate-700 text-sm truncate pr-4 block flex-1 select-none"
        />

        <div className="flex gap-8 text-xs text-slate-400">
          <span className="w-24 text-right">{file.date.toLocaleString()}</span>
          <span className="w-16 text-right font-mono">
            {formatSize(file.size)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FileCard;
