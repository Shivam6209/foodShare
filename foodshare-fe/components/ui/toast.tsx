import { cn } from "@/lib/utils";
import React, { createContext, useContext, useState } from "react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "warning" | "info";
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex w-80 items-start gap-3 rounded-lg border p-4 shadow-md transition-all duration-300 transform translate-x-0 opacity-100",
            {
              "bg-green-50 border-green-200": toast.type === "success",
              "bg-red-50 border-red-200": toast.type === "error",
              "bg-yellow-50 border-yellow-200": toast.type === "warning",
              "bg-blue-50 border-blue-200": toast.type === "info",
            }
          )}
        >
          <div className="flex-1">
            <h3 className={cn("text-sm font-medium", {
              "text-green-800": toast.type === "success",
              "text-red-800": toast.type === "error",
              "text-yellow-800": toast.type === "warning",
              "text-blue-800": toast.type === "info",
            })}>
              {toast.title}
            </h3>
            {toast.description && (
              <p className={cn("mt-1 text-xs", {
                "text-green-700": toast.type === "success",
                "text-red-700": toast.type === "error",
                "text-yellow-700": toast.type === "warning",
                "text-blue-700": toast.type === "info",
              })}>
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className={cn("text-xs hover:opacity-70", {
              "text-green-800": toast.type === "success",
              "text-red-800": toast.type === "error",
              "text-yellow-800": toast.type === "warning",
              "text-blue-800": toast.type === "info",
            })}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
} 