import React from "react";
import { MdInsertDriveFile } from "react-icons/md";
import { FilePreview } from "./file-preview";

// On exporte l'interface pour pouvoir la réutiliser dans Explorer.tsx
export interface FileItem {
  name: string;
  size: string;
  date: string;
  path: string;
}

interface FileCardProps {
  file: FileItem;
  viewMode: "grid" | "list";
  onClick?: () => void; // On anticipe : très utile pour plus tard !
}

const FileCard: React.FC<FileCardProps> = ({ file, viewMode, onClick }) => {
  // Les classes communes aux deux affichages (effets de survol, fond blanc)
  const baseClasses =
    "group bg-white border border-transparent cursor-pointer transition-all hover:border-blue-200 hover:bg-slate-50";

  // --- RENDU VUE GRILLE ---
  if (viewMode === "grid") {
    return (
      <div
        onClick={onClick}
        className={`${baseClasses} flex flex-col items-center text-center p-6 rounded-xl hover:shadow-lg hover:-translate-y-1`}
      >
        <div className="mb-4 text-blue-200 group-hover:text-blue-400 transition-colors flex items-center justify-center w-16 h-16">
          <FilePreview path={file.path} name={file.name} className="w-12 h-12" />
        </div>
        <div className="w-full">
          <span
            className="font-medium text-slate-700 truncate block text-sm"
            title={file.name}
          >
            {file.name}
          </span>
        </div>
      </div>
    );
  }

  // --- RENDU VUE LISTE ---
  return (
    <div
      onClick={onClick}
      className={`${baseClasses} flex items-center justify-between p-3 px-5 rounded-lg`}
    >
      <div className="mr-4 text-blue-300 flex items-center justify-center w-8 h-8">
        <FilePreview path={file.path} name={file.name} className="w-6 h-6" />
      </div>

      <div className="flex flex-1 items-center justify-between min-w-0">
        <span
          className="font-medium text-slate-700 truncate block text-sm pr-4"
          title={file.name}
        >
          {file.name}
        </span>

        <div className="flex gap-8 text-xs text-slate-400">
          <span className="w-24 text-right">{file.date}</span>
          <span className="w-16 text-right font-mono">{file.size}</span>
        </div>
      </div>
    </div>
  );
};

export default FileCard;
