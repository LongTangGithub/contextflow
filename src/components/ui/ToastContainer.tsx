"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import type { Toast, ToastAction, ToastPosition } from "@/lib/toast-context";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  // Group toasts by position
  const groupedToasts: Record<ToastPosition, Toast[]> = {
    'top-left': toasts.filter((toast) => toast.position === 'top-left'),
    'top-right': toasts.filter((toast) => toast.position === 'top-right'),
    'bottom-left': toasts.filter((toast) => toast.position === 'bottom-left'),
    'bottom-right': toasts.filter((toast) => toast.position === 'bottom-right'),
  };

  const renderToastsForPosition = (position: ToastPosition) => {
    const positionToasts = groupedToasts[position];
    if (positionToasts.length === 0) return null;

    const positionClasses = {
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
    };

    return (
      <div 
        key={ position } 
        className={`fixed z-50 flex flex-col gap-3 pointer-events-none ${positionClasses[position]}`}>
        {positionToasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {renderToastsForPosition('top-left')}
      {renderToastsForPosition('top-right')}
      {renderToastsForPosition('bottom-left')}
      {renderToastsForPosition('bottom-right')}
    </>
  );
}

// ============================================
// ToastItem Component
// ============================================

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isExisting, setIsExisting] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  const duration = toast.duration ?? 5000;
  const pauseOnHover = toast.pauseOnHover ?? true;

  // Sound effect
  useEffect(() => {
    if(!toast.sound) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      // Different frequencies for different types
      const frequencies = { success: 800, error: 400, warning: 600, info: 700, };
      oscillator.frequency.value = frequencies[toast.type];
      oscillator.type = 'sine';

      gain.gain.setValueAtTime(0.1, audioContext.currentTime );
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch ( error ) {
      console.warn('Sound notification not supported ')
    }
  }, [toast.sound, toast.type]);

  // Auto-dismiss Logic with Pause Support
  useEffect(() => {
    if (isPaused) return;

    // TODO: Create interval to update progress bar
    const interval = setInterval(() => {
      setProgress((prev) => {
        const decrement = 100 / (duration / 100);
        const newProgress = prev - decrement;
        if (newProgress <= 0) {
          clearInterval(interval);
          return 0;
        }
        return newProgress;
      });
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
  }, [duration, onRemove, toast.id, isPaused]);

  // Pause / Resume Handlers
  const handleMouseEnter = () => {
    if (pauseOnHover) setIsPaused(true);
  };

  const handleMouseLeave = () => {
    if(pauseOnHover) setIsPaused(false);
  };

  // Manual Close Handler
  const handleClose = () => {
    setIsExisting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

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
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      icon: 'text-yellow-600',
      progressBg: 'bg-yellow-500',
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
    const iconProps = { className: `w-5 h-5 ${config.icon}` };

    switch (toast.type) {
      case "success":
        return <CheckCircle {...iconProps} />;
      case "error":
        return <XCircle {...iconProps} />;
      case "warning":
        return <AlertTriangle {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  // TODO: Determine animation class based on isExisting
  const animationClass = isExisting
    ? "animate-out fade-out-80 slide-out-to-right-full duration-300"
    : "animate-in slide-in-from-right-5 fade-in duration-300";

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
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* TODO: Render progress bar at bottom */}
      <div className='absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5'>
        <div
          className={`h-full ${config.progressBg} ${isPaused ? '' : 'transition-all duration-100'}`}
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

        {/* Action Buttons */}
        {toast.actions && toast.actions.length > 0 && (
          <div className='flex gap-2 mt-3'>
            {toast.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  handleClose();
                }}
                className="text-sm font-medium px-3 py-1.5 rounded-md bg-black/5 hover:bg-black/10 transition-colors duration-200"
              >
                {action.label}
              </button>
            ))}
          </div>
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

