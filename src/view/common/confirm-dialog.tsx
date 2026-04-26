import { Button } from "@view/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@view/ui/dialog";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface ConfirmDialogProps {
  title: string;
  message?: string;
  onSubmit?: (confirmed: boolean) => void;
}
export interface ConfirmDialogRef {
  open: () => void;
  close: () => void;
}

export const ConfirmDialog = forwardRef<ConfirmDialogRef, ConfirmDialogProps>(
  ({ title, message, onSubmit }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => {
        setIsOpen(true);
      },
      close: () => {
        setIsOpen(false);
      },
    }));

    const handleSubmit = (confirmed: boolean) => {
      onSubmit?.(confirmed);
      setIsOpen(false);
    };

    return (
      <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {message && <DialogDescription>{message}</DialogDescription>}
          </DialogHeader>

          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="ghost"
              onClick={(e) => {
                handleSubmit(false);
                e.stopPropagation();
              }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="destructive"
              onClick={(e) => {
                handleSubmit(true);
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
