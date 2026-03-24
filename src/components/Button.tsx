import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-500 hover:to-blue-500 text-white shadow-glow-sm hover:shadow-glow-md active:scale-95',
    secondary:
      'bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/15 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 shadow-card hover:shadow-card-hover active:scale-95',
    outline:
      'border-2 border-navy-500 dark:border-navy-400 text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-500/10 active:scale-95',
    ghost:
      'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95',
    gold:
      'bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-white shadow-glow-gold hover:shadow-lg active:scale-95',
  };

  const sizeClasses = {
    sm:  'px-3.5 py-2 text-sm gap-1.5',
    md:  'px-5 py-2.5 text-sm gap-2',
    lg:  'px-7 py-3.5 text-base gap-2',
    xl:  'px-9 py-4 text-lg gap-2.5',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
