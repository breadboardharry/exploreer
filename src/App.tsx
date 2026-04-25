import useExplorer from "@hooks/use-explorer";
import Explorer from "./view/pages/explorer.page";
import Home from "./view/pages/home.page";

function App() {
  const { directory } = useExplorer(); // On utilise le hook pour récupérer le dossier sélectionné

  // Si un dossier est sélectionné, on affiche l'explorateur
  if (directory) {
    return <Explorer />;
  }

  // Sinon, on affiche la page d'accueil.
  return <Home />;
}

export default App;
