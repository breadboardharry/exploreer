import { useCallback, useState } from "react";

export interface UseSelectionResult {
  selectedKeys: Set<string>;
  toggle: (
    index: number,
    isCtrlPressed: boolean,
    isShiftPressed: boolean,
  ) => void;
  clear: () => void;
}

export function useSelection<T>(
  items: T[],
  getKey: (item: T) => string,
): UseSelectionResult {
  // On utilise un Set (Ensemble) pour des performances O(1) lors de la vérification
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

  const toggle = useCallback(
    (index: number, isCtrlPressed: boolean, isShiftPressed: boolean) => {
      if (!items || !items[index]) return;

      const key = getKey(items[index]);

      if (isShiftPressed && lastClickedIndex !== null) {
        // --- 1. MAJ + Clic : Sélection d'une plage ---
        const start = Math.min(lastClickedIndex, index);
        const end = Math.max(lastClickedIndex, index);
        const newSelection = new Set<string>();

        for (let i = start; i <= end; i++) {
          newSelection.add(getKey(items[i]));
        }
        setSelectedKeys(newSelection);
        setLastClickedIndex(index);
      } else if (isCtrlPressed) {
        // --- 2. CTRL + Clic : Ajout / Suppression ---
        const newSelection = new Set(selectedKeys);
        if (newSelection.has(key)) {
          newSelection.delete(key);
        } else {
          newSelection.add(key);
        }
        setSelectedKeys(newSelection);
        setLastClickedIndex(index);
      } else {
        // --- 3. Clic simple : Sélection unique (ou désélection) ---
        if (selectedKeys.has(key) && selectedKeys.size === 1) {
          // Si l'élément est déjà le seul sélectionné, on ne fait rien (pas de désélection)
        } else {
          setSelectedKeys(new Set([key])); // Remplace toute la sélection par celui-ci
        }
        setLastClickedIndex(index);
      }
    },
    [items, getKey, selectedKeys, lastClickedIndex],
  );

  const clear = useCallback(() => {
    setSelectedKeys(new Set());
    setLastClickedIndex(null);
  }, []);

  return { selectedKeys, toggle, clear };
}
