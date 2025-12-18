import { useState } from "react";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogFooter,
    DialogTitle,
  } from "@/components/ui/dialog"
  

  export const useConfirm = (
    title: string,
    message: string,
  ): [() => JSX.Element, () => Promise<unknown>] => {
    const [promise, setPrpmise] = useState<{ resolve: (value: boolean) => void } | null> (null);

    const confirm = () => new Promise((resolve, reject) => {
        setPrpmise({ resolve });
    })

    const handleClose = () => {
        setPrpmise(null);
    }

    const handleConfirm = () => {
        promise?.resolve(true);
        handleClose();
    }

    const handleCancel = () => {
        Promise?.resolve(false);
        handleClose();
    }

    const ConfirmationDialog = () => (
        <Dialog open={promise !== null}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription> {message} </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        onClick={handleCancel}
                        variant="outline"
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm}>
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
      
    );

    return [ConfirmationDialog, confirm];

  }