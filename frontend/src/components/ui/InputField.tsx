import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-stone-300">
          {label}
        </label>
        <input
          ref={ref}
          className={clsx(
            'input',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
            className
          )}
          {...props}
        />
        {error && (
          <p className="font-sans text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
export default InputField;