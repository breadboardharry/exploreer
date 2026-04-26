import { createContext, ReactNode, useState } from "react";

export const MAX_HISTORY_LENGTH = 8;

export interface HistoryContextType {
  history: string[];
  push(path: string): void;
}

export const HistoryContext = createContext<HistoryContextType | undefined>(
  undefined,
);

interface HistoryProviderProps {
  children: ReactNode;
}
const HistoryProvider: React.FC<HistoryProviderProps> = ({ children }) => {
  const [history, setHistory] = useState<string[]>([]);

  /**
   * Ajoute un nouvel élément à l'historique
   * - Si l'historique dépasse la longueur maximale, le plus ancien élément est supprimé
   * - Si le chemin existe déjà dans l'historique, il est déplacé au bout de la liste
   * @param path 
   */
  const push = (path: string) => {
    setHistory((prev) => {
      // Si le chemin existe déjà, on le retire pour le réajouter à la fin
      const filtered = prev.filter((p) => p !== path);
      const newHistory = [...filtered, path];
      if (newHistory.length > MAX_HISTORY_LENGTH) {
        newHistory.shift();
      }
      return newHistory;
    });
  };

  return (
    <HistoryContext.Provider value={{ history, push }}>
      {children}
    </HistoryContext.Provider>
  );
};

export default HistoryProvider;
