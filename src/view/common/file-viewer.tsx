import { FileItem } from "@lib/file/file";
import { formatSize } from "@lib/utils/file.utils";
import { convertFileSrc } from "@tauri-apps/api/core";
import { readTextFile } from "@tauri-apps/plugin-fs";
import React, { useEffect, useState } from "react";
import {
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdErrorOutline,
} from "react-icons/md";

// --- 1. LES STRATÉGIES SPÉCIALISÉES ---

interface ViewerProps {
  path: string;
}

// Stratégie : Images
const ImageViewer: React.FC<ViewerProps> = ({ path }) => (
  <img
    src={convertFileSrc(path)}
    alt="Aperçu"
    className="max-w-full max-h-[70vh] object-contain rounded-md shadow-sm select-none pointer-events-none"
  />
);

// Stratégie : Vidéos
const VideoViewer: React.FC<ViewerProps> = ({ path }) => (
  <video
    src={convertFileSrc(path)}
    controls
    autoPlay
    className="max-w-full max-h-[70vh] rounded-md shadow-sm select-none"
  />
);

// Stratégie : Audio
const AudioViewer: React.FC<ViewerProps> = ({ path }) => (
  <div className="flex items-center justify-center p-12 bg-slate-50 rounded-md w-full">
    <audio src={convertFileSrc(path)} controls className="w-full max-w-md" />
  </div>
);

// Stratégie : Fichiers Texte (Nécessite de lire le fichier de manière asynchrone)
const TextViewer: React.FC<ViewerProps> = ({ path }) => {
  const [content, setContent] = useState<string>("Chargement du texte...");

  useEffect(() => {
    const loadText = async () => {
      try {
        const text = await readTextFile(path);
        // On limite l'affichage pour éviter de faire crasher le navigateur sur des logs de 500Mo
        setContent(
          text.length > 50000
            ? text.substring(0, 50000) +
                "\n\n[... Fichier trop volumineux, affichage tronqué ...]"
            : text,
        );
      } catch (error) {
        console.error("Erreur lors de la lecture du fichier texte :", error);
        setContent("Impossible de lire ce fichier texte.");
      }
    };
    loadText();
  }, [path]);

  return (
    <pre className="w-full max-h-[70vh] overflow-auto p-4 bg-slate-900 text-slate-100 text-sm font-mono rounded-md shadow-inner whitespace-pre-wrap">
      {content}
    </pre>
  );
};

// Stratégie : Fallback (Fichier non supporté)
const UnsupportedViewer: React.FC<ViewerProps> = () => (
  <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-4">
    <MdErrorOutline className="w-16 h-16 text-slate-300" />
    <p>Aucun aperçu disponible pour ce type de fichier.</p>
  </div>
);

// --- 2. LE DICTIONNAIRE DES STRATÉGIES ---

const VIEWER_STRATEGIES: Record<string, React.FC<ViewerProps>> = {
  // Images
  png: ImageViewer,
  jpg: ImageViewer,
  jpeg: ImageViewer,
  gif: ImageViewer,
  webp: ImageViewer,
  // Vidéos
  mp4: VideoViewer,
  webm: VideoViewer,
  mkv: VideoViewer,
  // Audio
  mp3: AudioViewer,
  wav: AudioViewer,
  ogg: AudioViewer,
  // Texte & Code
  txt: TextViewer,
  md: TextViewer,
  json: TextViewer,
  js: TextViewer,
  ts: TextViewer,
  tsx: TextViewer,
  html: TextViewer,
  css: TextViewer,
  csv: TextViewer,
};

// --- 3. LE COMPOSANT MODAL PRINCIPAL ---

interface FileViewerProps {
  isOpen: boolean;
  file: FileItem | null;
  position?: { index: number; total: number };
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const FileViewer: React.FC<FileViewerProps> = ({
  isOpen,
  file,
  position,
  onClose,
  onNext,
  onPrev,
}) => {
  // Le FileViewer gère toujours ses propres raccourcis clavier pour le confort,
  // mais il se contente d'appeler les fonctions que le parent lui donne.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && onNext) onNext();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || !file) return null;

  // Extraction de l'extension
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  // Sélection de la stratégie (ou Fallback si inconnu)
  const ViewerComponent = VIEWER_STRATEGIES[extension] || UnsupportedViewer;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 md:p-12 animate-in fade-in duration-200 overscroll-none"
      onClick={onClose}
    >
      {/* Bouton Précédent (Ne s'affiche que si onPrev est fourni) */}
      {onPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 md:left-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 focus:outline-none"
        >
          <MdChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Fenêtre Modale */}
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex flex-col min-w-0 pr-4">
            <h2
              className="text-sm font-semibold text-slate-700 truncate"
              title={file.name}
            >
              {file.name}
            </h2>
            {/* Affichage déporté du texte */}
            {position && (
              <span className="text-xs text-slate-400">
                {`Fichier ${position.index + 1} sur ${position.total} • ${formatSize(file.size)}`}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-hidden flex items-center justify-center bg-slate-100/50 flex-1 relative min-h-75">
          <div
            key={file.path}
            className="animate-in fade-in slide-in-from-right-4 duration-300 w-full h-full flex justify-center items-center"
          >
            <ViewerComponent path={file.path} />
          </div>
        </div>
      </div>

      {/* Bouton Suivant */}
      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 md:right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 focus:outline-none"
        >
          <MdChevronRight className="w-8 h-8" />
        </button>
      )}
    </div>
  );
};
