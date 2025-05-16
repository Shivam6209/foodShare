"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CustomModal } from "@/components/ui/custom-modal";

interface CustomConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function CustomConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "OK",
  cancelText = "Cancel",
  confirmVariant = "default"
}: CustomConfirmDialogProps) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="400px"
      showCloseButton={false}
    >
      <div className="flex flex-col">
        {description && (
          <p className="mb-6 text-base text-muted-foreground">{description}</p>
        )}
        
        <div className="flex justify-end space-x-3">
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
        </div>
      </div>
    </CustomModal>
  );
} 