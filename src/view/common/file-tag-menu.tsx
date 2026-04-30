import useExplorer from "@hooks/use-explorer";
import { FileItemWithMetadata } from "@lib/file/file";
import { getRandomTagColor } from "@lib/tag/color";
import { Tag } from "@lib/tag/tag";
import { Button } from "@view/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@view/ui/input-group";
import { MenuGroup, MenuLabel, MenuSeparator } from "@view/ui/menu";
import { useState } from "react";
import { LuEllipsis } from "react-icons/lu";
import { TagBadge } from "./tag-badge";
import { TagEditMenu } from "./tag-edit-menu";

export interface FileTagMenuProps {
  file: FileItemWithMetadata;
}

export const FileTagMenu: React.FC<FileTagMenuProps> = ({ file }) => {
  const { tags, addFileTags, removeFileTags, addTag, manifest } = useExplorer();

  const [query, setQuery] = useState("");
  const [nextTagColor, setNextTagColor] = useState(getRandomTagColor());

  const handleAddTag = (tag: Tag) => {
    if (file.tags.some((t) => t === tag.name)) return;
    addFileTags(file, [tag.name]);

    // Si l'utilisateur a saisi un nom de tag, on le réinitialise après l'ajout (il a trouvé ce qu'il cherchait)
    if (query.length > 0) {
      setQuery("");
    }
  };

  const handleRemoveSelectedTag = (tag: string) => {
    if (!file.tags.some((t) => t === tag)) return;
    removeFileTags(file, [tag]);
  };

  const handleCreateTag = () => {
    if (query.trim().length === 0) return;

    // Vérifie si le tag existe déjà
    const existingTag = manifest.tags[query];
    if (existingTag) {
      handleAddTag({
        name: query,
        color: existingTag.color,
      });
      setQuery("");
      setNextTagColor(getRandomTagColor());
      return;
    }

    // Sinon, créer un nouveau tag
    const newTag = { name: query, color: nextTagColor };
    addTag(newTag.name, newTag.color);
    handleAddTag(newTag);
    setQuery("");
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

  const filteredTags = query.length
    ? tags.filter((t) => {
        const isSelected = file.tags.some((st) => st === t.name);
        const matchesSearch = t.name
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesSearch && !isSelected;
      })
    : tags;

  const hasPerfectMatch = tags.some(
    (t) => t.name.toLowerCase() === query.toLowerCase(),
  );

  return (
    <>
      <InputGroup className="flex-1 shrink-0 flex flex-wrap h-auto py-1 overflow-x-hidden overflow-y-clip border-0 bg-slate-100 rounded-none ring-0!">
        {file.tags.map((tagName) => (
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
                color={manifest.tags[tagName]?.color}
                showRemove
                onRemove={() => handleRemoveSelectedTag(tagName)}
              />
            </InputGroupText>
          </InputGroupAddon>
        ))}

        <InputGroupInput
          className="basis-8 ring-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={!file.tags.length ? "Rechercher un tag..." : ""}
        />
      </InputGroup>

      <MenuSeparator className="mx-0 mt-0" />

      <MenuGroup className="overflow-y-auto overflow-x-hidden p-1 py-0">
        <MenuLabel className="flex items-center justify-between mb-1">
          Tags
        </MenuLabel>

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

                <TagEditMenu
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
              {query.length > 0
                ? "Aucun tag trouvé"
                : "Aucun tag disponible. Créez-en un en saisissant un nom ci-dessus."}
            </div>
          )}
        </div>

        {/* Bouton d'ajout de tag */}
        {query.length > 0 && !hasPerfectMatch && (
          <Button
            className="font-normal"
            variant="ghost"
            size="xs"
            onClick={() => handleCreateTag()}
          >
            Ajouter
            <TagBadge name={query} color={nextTagColor} className="ml-0.5" />
          </Button>
        )}
      </MenuGroup>
    </>
  );
};
