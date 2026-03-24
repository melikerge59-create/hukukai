import { ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closable = true,
}: ModalProps) {
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true))
      );
      document.body.style.overflow = 'hidden';
    } else {
      setVisible(false);
      const t = setTimeout(() => setRendered(false), 280);
      document.body.style.overflow = '';
      return () => clearTimeout(t);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!rendered) return null;

  const maxW = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={closable ? onClose : undefined}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-280
          ${visible ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Panel */}
      <div
        className={`relative w-full ${maxW[size]} max-h-[90vh] overflow-y-auto scrollbar-thin
          bg-white dark:bg-surface-dcard rounded-2xl
          border border-border-light dark:border-border-dark
          shadow-card-lg
          transition-all duration-280
          ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-3'}`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-border-light dark:border-border-dark">
            <h2 className="font-serif text-xl font-bold text-text dark:text-white">{title}</h2>
            {closable && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-muted hover:text-text dark:hover:text-white
                  hover:bg-surface-card2 dark:hover:bg-white/10 transition-all"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        {!title && closable && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-text-muted
              hover:text-text dark:hover:text-white hover:bg-surface-card2 dark:hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
