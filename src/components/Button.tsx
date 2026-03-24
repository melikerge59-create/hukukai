import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 select-none ' +
    'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] focus-visible:outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-offset-2';

  const variants: Record<string, string> = {
    primary:
      'bg-primary-DEFAULT hover:bg-primary-hover text-white shadow-primary hover:shadow-primary-lg ' +
      'focus-visible:ring-primary-DEFAULT',
    secondary:
      'bg-white dark:bg-surface-dcard2 hover:bg-gray-50 dark:hover:bg-slate-700 text-text dark:text-white ' +
      'border border-border-light dark:border-border-dark shadow-card hover:shadow-card-md ' +
      'focus-visible:ring-gray-400',
    outline:
      'border-2 border-primary-DEFAULT dark:border-primary-400 text-primary-DEFAULT dark:text-primary-300 ' +
      'hover:bg-primary-50 dark:hover:bg-primary-900/20 focus-visible:ring-primary-DEFAULT',
    ghost:
      'text-text-2 dark:text-slate-400 hover:bg-surface-card2 dark:hover:bg-white/5 ' +
      'hover:text-primary-DEFAULT dark:hover:text-white focus-visible:ring-gray-400',
    accent:
      'bg-accent-DEFAULT hover:bg-accent-hover text-white shadow-accent hover:shadow-lg ' +
      'focus-visible:ring-accent-DEFAULT',
    danger:
      'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md focus-visible:ring-red-500',
  };

  const sizes: Record<string, string> = {
    xs: 'px-2.5 py-1.5 text-xs gap-1',
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3 text-base gap-2',
    xl: 'px-9 py-4 text-lg gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
          </svg>
          <span>İşleniyor...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
