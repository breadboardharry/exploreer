import useExplorer from "@hooks/use-explorer";
import { FileItem, removeExtension } from "@lib/file/file";
import { ask } from "@tauri-apps/plugin-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@view/ui/context-menu";
import { useRef } from "react";
import { RenameDialog, RenameDialogRef } from "./rename-dialog";

export const FileContextMenu: React.FC<{
  file: FileItem;
  trigger: () => React.ReactElement;
}> = ({ file, trigger }) => {
  const explorer = useExplorer();

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
              Delete
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
