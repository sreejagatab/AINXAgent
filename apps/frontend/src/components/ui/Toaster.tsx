import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: 'default' | 'success' | 'error' | 'warning';
  duration?: number;
}

interface ToastProps extends Toast {
  onDismiss: (id: string) => void;
}

const toastVariants = {
  initial: { opacity: 0, y: 50, scale: 0.3 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
};

const Toast = ({ id, title, description, type = 'default', duration = 5000, onDismiss }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        'pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
        {
          'bg-background text-foreground': type === 'default',
          'bg-success text-success-foreground': type === 'success',
          'bg-destructive text-destructive-foreground': type === 'error',
          'bg-warning text-warning-foreground': type === 'warning',
        }
      )}
    >
      <div className="grid gap-1">
        {title && <h5 className="text-sm font-semibold">{title}</h5>}
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-end justify-center px-4 py-6 sm:items-start sm:justify-end">
      <div className="max-w-xl w-full space-y-4">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} onDismiss={dismissToast} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
} 