import { Button } from "@view/ui/button";
import { Separator } from "@view/ui/separator";
import React from "react";
import { MdClose, MdDelete } from "react-icons/md";

interface SelectionBarProps {
  count: number;
  onClear: () => void;
  onDelete: () => void;
}

export const SelectionBar: React.FC<SelectionBarProps> = ({
  count,
  onClear,
  onDelete,
}) => {
  if (count === 0) return null;

  return (
    <div className="w-140 max-w-[calc(100vw-4rem)] fixed bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-in slide-in-from-bottom-8 duration-300">
      <div className="bg-white text-slate-800 p-3 rounded-xl shadow-2xl flex items-center gap-6 border border-slate-200 pointer-events-auto">
        {/* Compteur */}
        <div className="flex items-center gap-3 pl-2">
          <p className="text-sm font-medium inline">
            <span className="text-xs font-bold">{count}</span>
            {count > 1 ? " éléments sélectionnés" : " élément sélectionné"}
          </p>
        </div>

        <Separator orientation="vertical" className="my-1" />

        {/* Actions */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button onClick={onDelete} variant="destructive">
            <MdDelete />
            Supprimer
          </Button>

          {/* Bouton fermer rapide */}
          <Button onClick={onClear} variant="ghost" size="icon">
            <MdClose className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
