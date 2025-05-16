"use client";

import * as React from "react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "OK",
  cancelText = "Cancel",
  confirmVariant = "default"
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-40 bg-black/50" />
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          <DialogContent 
            className="relative z-50 w-full max-w-[450px] rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg focus:outline-none"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
              {description && <DialogDescription className="mt-2 text-base text-gray-600">{description}</DialogDescription>}
            </DialogHeader>
            
            <DialogFooter className="mt-6 flex flex-row items-center justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="min-w-[90px] rounded-md px-4 py-2"
              >
                {cancelText}
              </Button>
              <Button 
                variant={confirmVariant} 
                onClick={onConfirm}
                className="min-w-[90px] rounded-md px-4 py-2"
              >
                {confirmText}
              </Button>
            </DialogFooter>
          </DialogContent>
        </div>
      </DialogPortal>
    </Dialog>
  );
} 