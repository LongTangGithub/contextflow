"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { useToast, type Toast } from "@/lib/toast-context";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isExisting, setIsExisting] = useState(false);
  const [progress, setProgress] = useState(100);

  const duration = 5000;

  useEffect(() => {
    // TODO: Create interval to update progress bar
    const interval = setInterval(() => {
      setProgress((prev) => prev - 100 / (duration / 100));
    }, 100);

    // TODO: Create timer to trigger exit animation
    const timer = setTimeout(() => {
      setIsExisting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [toast.id, onRemove, duration]);

  // TODO: Create config object with colors for each type
  const typeConfig = {
    success: {
      bg: 'bg-green-50',          
      border: 'border-green-500',   
      icon: 'text-green-600',       
      progressBg: 'bg-green-500',  
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      icon: 'text-red-600',
      progressBg: 'bg-red-500',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      icon: 'text-blue-600',
      progressBg: 'bg-blue-500',
    },
  };

  const config = typeConfig[toast.type];

  // TODO: Get icon based on toast type
  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className={`w-5 h-5 ${config.icon}`} />;
      case "error":
        return <XCircle className={`w-5 h-5 ${config.icon}`} />;
      default:
        return <Info className={`w-5 h-5 ${config.icon}`} />;
    }
  };

  // TODO: Determine animation class based on isExisting
  const animationClass = isExisting
    ? "animate-out fade-out-80 slide-out-to-right-full duration-300"
    : "animate-in slide-in-from-right-5 fade-in duration-300";

  // TODO: Handle manual close with exit animation
  const handleClose = () => {
    setIsExisting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`
        ${animationClass}
        ${config.bg}
        ${config.border}
        border rounded-lg shadow-lg overflow-hidden
        transition-all duration-300 relative
      `}
      role="alert"
      aria-live="assertive"
    >
      {/* TODO: Render progress bar at bottom */}
      <div className='absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5'>
        <div
          className={`h-full ${config.progressBg} transition-all duration-100`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className='p-4 flex items-start gap-3'>
        <div className="shrink-0 mt-0.5">{getIcon()}</div>

        {/* TODO: Render message and description */}
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium text-foreground'>
            {toast.message}
          </p>

          {toast.description && (
            <p className='text-sm text-muted-foreground mt-1'>
              {toast.description}
            </p>
          )}
        </div>

        {/* TODO: Close button with handleClose */}
        <button
          onClick={handleClose}
          className='shrink-0 text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 cursor-pointer'
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

