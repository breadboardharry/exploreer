import useExplorer from "@hooks/use-explorer";
import { FileItemWithMetadata, removeExtension } from "@lib/file/file";
import { getRandomTagColor, TAG_COLORS } from "@lib/tag/color";
import { Tag } from "@lib/tag/tag";
import { ask } from "@tauri-apps/plugin-dialog";
import { Button } from "@view/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@view/ui/context-menu";
import { Input } from "@view/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@view/ui/input-group";
import { useEffect, useRef, useState } from "react";
import { LuEllipsis, LuTrash } from "react-icons/lu";
import { ConfirmDialog, ConfirmDialogRef } from "./confirm-dialog";
import { RenameDialog, RenameDialogRef } from "./rename-dialog";
import { TagBadge } from "./tag-badge";

export const FileContextMenu: React.FC<{
  file: FileItemWithMetadata;
  trigger: () => React.ReactElement;
}> = ({ file, trigger }) => {
  const { tags, ...explorer } = useExplorer();

  const renameDialogRef = useRef<RenameDialogRef>(null);

  const handleDelete = async () => {
    const confirmed = await ask(
      `Êtes-vous sûr de vouloir supprimer définitivement le fichier "${file.name}" ?`,
      { title: "Confirmer la suppression", kind: "warning" },
    );

    if (!confirmed) return;

    await explorer.deleteFile(file);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>{trigger()}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuLabel>Organiser</ContextMenuLabel>

            <TagsMenu file={file} trigger={<>Tags</>} />
          </ContextMenuGroup>

          <ContextMenuSeparator />

          <ContextMenuGroup>
            <ContextMenuLabel>Éditer</ContextMenuLabel>
            <ContextMenuItem
              onClick={() =>
                renameDialogRef.current?.open(removeExtension(file.name), {
                  tailing: file.extension ? "." + file.extension : "",
                })
              }
            >
              Renommer
            </ContextMenuItem>
          </ContextMenuGroup>

          <ContextMenuSeparator />

          <ContextMenuGroup>
            <ContextMenuItem variant="destructive" onClick={handleDelete}>
              <LuTrash />
              Supprimer
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>

      <RenameDialog
        ref={renameDialogRef}
        onSubmit={(newName, { tailing }) =>
          explorer.renameFile(file, newName + tailing)
        }
      />
    </>
  );
};

export const TagsMenu: React.FC<{
  file: FileItemWithMetadata;
  trigger: React.ReactElement;
}> = ({ file, trigger }) => {
  const { tags, addFileTags, removeFileTags, addTag, manifest } = useExplorer();

  const [name, setName] = useState("");
  const [nextTagColor, setNextTagColor] = useState(getRandomTagColor());

  const handleAddTag = (tag: Tag) => {
    if (file.tags.some((t) => t === tag.name)) return;
    addFileTags(file, [tag.name]);

    // Si l'utilisateur a saisi un nom de tag, on le réinitialise après l'ajout (il a trouvé ce qu'il cherchait)
    if (name.length > 0) {
      setName("");
    }
  };

  const handleRemoveSelectedTag = (tag: string) => {
    if (!file.tags.some((t) => t === tag)) return;
    removeFileTags(file, [tag]);
  };

  const handleCreateTag = () => {
    if (name.trim().length === 0) return;

    // Vérifie si le tag existe déjà
    const existingTag = manifest.tags[name];
    if (existingTag) {
      handleAddTag({
        name,
        color: existingTag.color,
      });
      setName("");
      setNextTagColor(getRandomTagColor());
      return;
    }

    // Sinon, créer un nouveau tag
    const newTag = { name, color: nextTagColor };
    addTag(newTag.name, newTag.color);
    handleAddTag(newTag);
    setName("");
    setNextTagColor(getRandomTagColor());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Empêche le Context Menu de BaseUI d'intercepter la touche
    e.stopPropagation();

    // Si "Entrée", on crée le tag
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateTag();
    }
  };

  const filteredTags = name.length
    ? tags.filter((t) => {
        const isSelected = file.tags.some((st) => st === t.name);
        const matchesSearch = t.name.toLowerCase().includes(name.toLowerCase());
        return matchesSearch && !isSelected;
      })
    : tags;

  const hasPerfectMatch = tags.some(
    (t) => t.name.toLowerCase() === name.toLowerCase(),
  );

  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger>{trigger}</ContextMenuSubTrigger>
      <ContextMenuSubContent className="w-56">
        {/* Input */}
        <InputGroup className="flex flex-wrap h-auto overflow-x-hidden">
          {file.tags.length > 0 &&
            file.tags.map((tagName) => (
              <InputGroupAddon
                key={tagName}
                align="inline-start"
                className="flex gap-1 py-1 min-w-0"
              >
                <InputGroupText
                  key={tagName}
                  className="flex flex-wrap justify-start min-w-0"
                >
                  <TagBadge
                    name={tagName}
                    color={manifest.tags[tagName].color}
                    showRemove
                    onRemove={() => handleRemoveSelectedTag(tagName)}
                  />
                </InputGroupText>
              </InputGroupAddon>
            ))}

          <InputGroupInput
            className="basis-8"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={!file.tags.length ? "Rechercher un tag..." : ""}
          />
        </InputGroup>

        <ContextMenuSeparator />

        {/* Liste des tags */}
        <ContextMenuLabel className="flex items-center justify-between">
          Tags
          {/* <Button variant="ghost" size="icon-xs">
            <LuPlus />
          </Button> */}
        </ContextMenuLabel>

        <div className="flex flex-col gap-1 min-w-0">
          {filteredTags.length ? (
            filteredTags.map((tag) => (
              <div
                key={tag.name}
                className="group min-h-6 -mx-1 px-1.5 flex-1 flex gap-1 items-center justify-between hover:bg-slate-50"
              >
                <TagBadge
                  name={tag.name}
                  color={tag.color}
                  clickable
                  onClick={() => handleAddTag(tag)}
                />

                <TagMenu
                  tag={tag}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="group-hover:flex hidden"
                    >
                      <LuEllipsis />
                    </Button>
                  }
                />
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground italic px-1.5 py-2">
              {name.length > 0
                ? "Aucun tag trouvé"
                : "Aucun tag disponible. Créez-en un en saisissant un nom ci-dessus."}
            </div>
          )}
        </div>

        {/* Bouton d'ajout de tag */}
        {name.length > 0 && !hasPerfectMatch && (
          <Button
            className="font-normal"
            variant="ghost"
            size="xs"
            onClick={() => handleCreateTag()}
          >
            Ajouter
            <TagBadge name={name} color={nextTagColor} className="ml-0.5" />
          </Button>
        )}
      </ContextMenuSubContent>
    </ContextMenuSub>
  );
};

export const TagMenu: React.FC<{
  tag: Tag;
  trigger: React.ReactElement;
}> = ({ tag, trigger }) => {
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
