"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  description?: string;
  duration?: number;
  position?: ToastPosition;
  pauseOnHover?: boolean;
  actions?: ToastAction[];
  sound?: boolean; 
}

export type ToastPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (
    message: string, 
    type: Toast["type"], 
    options?: {
      description?: string;
      duration?: number;
      position?: ToastPosition;
      pauseOnHover?: boolean;
      actions?: ToastAction[];
      sound?: boolean;
    }
  ) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);


// TODO: Add this ID generation function
// HINT: Combines timestamp + random string for uniqueness
// HINT: Math.random().toString(36) creates random alphanumeric string
// HINT: .substring(2, 11) takes 9 characters
function generateToastId(): string {
  // Should return someting like "1234567890-abc123def"
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (
    message: string,
    type: Toast["type"],
    options?: {
      description?: string;
      duration?: number;
      position?: ToastPosition;
      pauseOnHover?: boolean;
      actions?: ToastAction[];
      sound?: boolean
    }
  ) => {
    const newToast: Toast = {
      id: generateToastId(),
      message,
      type,
      description: options?.description,
      duration: options?.duration ?? 5000,
      position: options?.position ?? "top-right",
      pauseOnHover: options?.pauseOnHover ?? true,
      actions: options?.actions,
      sound: options?.sound ?? false,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
