import { open } from "@tauri-apps/plugin-dialog";
import React, { useState } from "react";

interface HomeProps {
  onSelectFolder: (path: string) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectFolder }) => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const handleSelectFolder = async () => {
    try {
      const selectedPath = await open({
        directory: true,
        multiple: false,
        title: "Sélectionner un dossier à explorer",
      });

      if (selectedPath) {
        setSelectedFolder(selectedPath as string);
        // On déclenche le changement de page dans App.tsx
        onSelectFolder(selectedPath as string);
      }
    } catch (error) {
      console.error(
        "Erreur lors de l'ouverture de la boîte de dialogue :",
        error,
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700 font-sans p-4">
      {/* La carte principale */}
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm text-center max-w-md w-full border border-slate-100">
        {/* L'icône de dossier */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-10 h-10 text-blue-300"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>

        {/* Typographie */}
        <h1 className="text-2xl font-semibold mb-2 text-slate-800">
          Bienvenue dans votre Explorateur
        </h1>
        <p className="text-sm leading-relaxed text-slate-400 mb-8">
          Pour commencer, sélectionnez le répertoire que vous souhaitez analyser
          et explorer.
        </p>

        {/* Le bouton d'action principal */}
        <button
          className="bg-blue-100 text-blue-900 px-7 py-3 text-base font-semibold rounded-lg transition-all duration-200 hover:bg-blue-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
          onClick={handleSelectFolder}
        >
          Choisir un dossier
        </button>

        {/* L'affichage du chemin (s'affichera un bref instant avant la transition vers l'Explorer) */}
        {selectedFolder && (
          <div className="mt-8 pt-6 border-t border-dashed border-slate-200 flex flex-col gap-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              Sélection actuelle :
            </span>
            <code className="bg-slate-50 p-2 rounded-md text-sm text-slate-600 break-all border border-slate-200">
              {selectedFolder}
            </code>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
