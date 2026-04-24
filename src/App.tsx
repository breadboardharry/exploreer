import { useState } from "react";
import Home from "./view/pages/home.page";
import Explorer from "./view/pages/explorer.page";

function App() {
  // Stocke le chemin du dossier sélectionné
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Si un dossier est sélectionné, on affiche l'explorateur
  if (selectedFolder) {
    return (
      <Explorer
        folderPath={selectedFolder}
        onBack={() => setSelectedFolder(null)} // Permet de revenir à l'accueil
      />
    );
  }

  // Sinon, on affiche la page d'accueil.
  // Note: Il faudra modifier Home.tsx pour qu'il accepte cette prop et l'appelle
  // avec le chemin sélectionné au lieu de faire un console.log()
  return <Home onSelectFolder={setSelectedFolder} />;
}

export default App;
