import { Button } from "@view/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@view/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@view/ui/input-group";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface RenameDialogProps {
  title?: string;
  placeholder?: string;
  onSubmit?: (newName: string, options: { tailing: string }) => void;
}
export interface RenameDialogRef {
  open: (
    name: string,
    options?: {
      tailing?: string;
    },
  ) => void;
  close: () => void;
}

export const RenameDialog = forwardRef<RenameDialogRef, RenameDialogProps>(
  ({ title, placeholder, onSubmit }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [tailing, setTailing] = useState("");

    useImperativeHandle(ref, () => ({
      open: (name: string, options?: { tailing?: string }) => {
        setName(name);
        setTailing(options?.tailing || "");
        setIsOpen(true);
      },
      close: () => {
        setIsOpen(false);
      },
    }));

    const handleSubmit = () => {
      onSubmit?.(name, { tailing });
      setIsOpen(false);
    };

    return (
      <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title || "Renommer le fichier"}</DialogTitle>
          </DialogHeader>

          <div>
            <InputGroup>
              <InputGroupInput
                placeholder={placeholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {tailing && (
                <InputGroupAddon align="inline-end">
                  <InputGroupText>{tailing}</InputGroupText>
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>

          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="ghost"
              onClick={(e) => {
                setIsOpen(false);
                e.stopPropagation();
              }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              onClick={(e) => {
                handleSubmit();
                e.stopPropagation();
              }}
            >
              Valider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);
