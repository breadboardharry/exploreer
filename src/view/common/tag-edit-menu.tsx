import useExplorer from "@hooks/use-explorer";
import { TAG_COLORS } from "@lib/tag/color";
import { Tag } from "@lib/tag/tag";
import {
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@view/ui/context-menu";
import { Input } from "@view/ui/input";
import { useEffect, useRef, useState } from "react";
import { LuTrash } from "react-icons/lu";
import { ConfirmDialog, ConfirmDialogRef } from "./confirm-dialog";

export interface TagEditMenuProps {
  tag: Tag;
  trigger: React.ReactElement;
}

export const TagEditMenu: React.FC<TagEditMenuProps> = ({ tag, trigger }) => {
  const { getTagUseCount, renameTag, changeTagColor, deleteTag } =
    useExplorer();
  const [name, setName] = useState(tag.name);

  const deleteConfirmModalRef = useRef<ConfirmDialogRef>(null);

  const tagUseCount = getTagUseCount(tag.name);

  useEffect(() => {
    setName(tag.name);
  }, [tag.name]);

  const onClose = () => {
    if (name.trim().length === 0) {
      setName(tag.name);
      return;
    }
    if (name !== tag.name) {
      renameTag(tag.name, name);
    }
  };

  return (
    <ContextMenuSub
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <ContextMenuSubTrigger
        icon={false}
        className="m-0 p-0"
        openOnHover={false}
      >
        {trigger}
      </ContextMenuSubTrigger>

      <ContextMenuSubContent className="w-48">
        <ContextMenuLabel>Informations</ContextMenuLabel>

        <Input
          className="mb-1"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          onKeyDown={(e) => {
            // Empêche le menu parent d'intercepter la touche
            e.stopPropagation();
          }}
        />

        <ContextMenuSeparator />

        <ContextMenuLabel>Couleur</ContextMenuLabel>

        <ContextMenuRadioGroup
          value={tag.color}
          onValueChange={(color) => {
            changeTagColor(tag.name, color);
          }}
        >
          {TAG_COLORS.map(({ color, label }) => (
            <ContextMenuRadioItem
              key={color}
              value={color}
              className="flex items-center gap-2 text-sm"
            >
              <span
                className="mt-0.5 size-3 rounded block"
                style={{ backgroundColor: color }}
              ></span>
              {label}
            </ContextMenuRadioItem>
          ))}
        </ContextMenuRadioGroup>

        <ContextMenuSeparator />

        <ContextMenuItem
          variant="destructive"
          onClick={() => deleteConfirmModalRef.current?.open()}
          closeOnClick={false}
        >
          <LuTrash />
          Supprimer
        </ContextMenuItem>
      </ContextMenuSubContent>

      <ConfirmDialog
        ref={deleteConfirmModalRef}
        title={`Supprimer le tag "${tag.name}" ?`}
        message={
          tagUseCount
            ? `Ce tag est utilisé par ${tagUseCount} fichier(s). Il sera retiré de tous les fichiers auxquels il est associé.`
            : "Êtes-vous sûr de vouloir supprimer ce tag ?"
        }
        onSubmit={(confirmed) => {
          if (!confirmed) return;
          deleteTag(tag.name);
        }}
      />
    </ContextMenuSub>
  );
};
