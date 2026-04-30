import useExplorer from "@hooks/use-explorer";
import { FileItemWithMetadata, removeExtension } from "@lib/file/file";
import { ask } from "@tauri-apps/plugin-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@view/ui/context-menu";
import { useRef } from "react";
import { LuTrash } from "react-icons/lu";
import { FileTagMenu } from "./file-tag-menu";
import { RenameDialog, RenameDialogRef } from "./rename-dialog";

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

            <ContextMenuSub>
              <ContextMenuSubTrigger>Tags</ContextMenuSubTrigger>
              <ContextMenuSubContent className="max-h-96 w-64 pt-0 px-0 flex flex-col overflow-x-hidden overflow-y-hidden">
                <FileTagMenu file={file} />
              </ContextMenuSubContent>
            </ContextMenuSub>
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
