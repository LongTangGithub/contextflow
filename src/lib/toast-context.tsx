"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  description?: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: Toast["type"], description?: string) => void;
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
    description?: string,
  ) => {
    const newToast: Toast = {
      id: generateToastId(),
      message,
      type,
      description,
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
