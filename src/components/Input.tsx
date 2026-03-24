import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <div className={`relative rounded-xl transition-all duration-200 input-focus-ring ${error ? 'ring-1 ring-red-400' : ''}`}>
          <input
            ref={ref}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200
              ${error
                ? 'border-red-400 dark:border-red-500 focus:border-red-400'
                : 'border-gray-200 dark:border-white/10 focus:border-navy-400 dark:focus:border-navy-400'
              }
              bg-white dark:bg-white/5
              text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-600
              text-sm font-medium
              ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
