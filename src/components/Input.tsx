import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, suffix, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-text dark:text-white mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3.5 text-text-muted dark:text-slate-500 pointer-events-none z-10">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`input-base ${error ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-400/10' : ''}
              ${icon ? 'pl-10' : ''}
              ${suffix ? 'pr-12' : ''}
              ${className}`}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3.5 text-text-muted dark:text-slate-500 z-10">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-text-muted dark:text-slate-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
