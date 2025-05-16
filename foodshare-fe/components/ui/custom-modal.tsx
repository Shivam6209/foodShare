"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
  showCloseButton?: boolean;
}

export function CustomModal({
  isOpen,
  onClose,
  title,
  children,
  width = "450px",
  showCloseButton = true
}: CustomModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div 
        className="relative z-50 bg-white rounded-lg border-2 border-gray-200 shadow-xl overflow-hidden"
        style={{ 
          width: width, 
          maxWidth: "calc(100vw - 32px)", 
          maxHeight: "calc(100vh - 32px)"
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          {showCloseButton && (
            <Button 
              variant="ghost" 
              className="h-8 w-8 rounded-full p-0" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
        
        {/* Body */}
        <div className="max-h-[calc(100vh-140px)] overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
} 