import { convertFileSrc } from "@tauri-apps/api/core";
import { cn } from "../../lib/utils/style.utils";
import React from "react";
import {
  MdCode,
  MdDescription,
  MdInsertDriveFile,
  MdPictureAsPdf,
} from "react-icons/md";

// 1. Définition des types
interface PreviewProps {
  path: string;
  name: string;
  className?: string; // Pour que FileCard puisse gérer la taille (Grid vs List)
}

// 2. Les différents "Renderers" (composants spécialisés)
const ImagePreview: React.FC<PreviewProps> = ({ path, name, className }) => {
  // convertFileSrc transforme le chemin local en URL lisible par la webview
  const imageSrc = convertFileSrc(path);
  return (
    <img
      src={imageSrc}
      alt={name}
      className={cn("object-cover rounded-md select-none", className)}
    />
  );
};

const IconPreview = (IconComponent: React.FC<{ className?: string }>) => {
  return ({ className }: PreviewProps) => (
    <IconComponent className={className} />
  );
};

// 3. Le Dictionnaire des stratégies (C'EST ICI QUE C'EST MODULABLE)
// On associe des extensions à des composants.
const PREVIEW_STRATEGIES: Record<string, React.FC<PreviewProps>> = {
  // Images
  png: ImagePreview,
  jpg: ImagePreview,
  jpeg: ImagePreview,
  gif: ImagePreview,
  webp: ImagePreview,

  // Textes & Code
  txt: IconPreview(MdDescription),
  md: IconPreview(MdDescription),
  json: IconPreview(MdCode),
  js: IconPreview(MdCode),
  tsx: IconPreview(MdCode),

  // Documents
  pdf: IconPreview(MdPictureAsPdf),
};

// 4. Le composant Principal Aiguilleur
export const FilePreview: React.FC<PreviewProps> = (props) => {
  // On extrait l'extension du fichier (ex: "photo.png" -> "png")
  const extension = props.name.split(".").pop()?.toLowerCase() || "";

  // On cherche si on a une stratégie pour cette extension
  const StrategyComponent = PREVIEW_STRATEGIES[extension];

  // Si on a une stratégie, on l'utilise. Sinon on renvoie l'icône par défaut.
  if (StrategyComponent) {
    return <StrategyComponent {...props} />;
  }

  return <MdInsertDriveFile className={props.className} />;
};
