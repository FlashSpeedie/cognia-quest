import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

const fieldClass =
  "w-full rounded-xl border border-void-700 bg-void-850 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus-ring focus:border-pulse-400/50 transition-colors";

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, hint, error, id, className = "", ...props }, ref) => {
    const fieldId = id ?? label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return (
      <div className={className}>
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
        <input ref={ref} id={fieldId} className={fieldClass} aria-invalid={!!error} aria-describedby={error ? `${fieldId}-err` : hint ? `${fieldId}-hint` : undefined} {...props} />
        {hint && !error && (
          <p id={`${fieldId}-hint`} className="mt-1 text-xs text-ink-faint">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${fieldId}-err`} role="alert" className="mt-1 text-xs font-medium text-rose-400">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, id, className = "", ...props }, ref) => {
    const fieldId = id ?? label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return (
      <div className={className}>
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
        <textarea ref={ref} id={fieldId} className={`${fieldClass} min-h-[7rem] resize-y`} aria-invalid={!!error} {...props} />
        {hint && !error && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
        {error && (
          <p role="alert" className="mt-1 text-xs font-medium text-rose-400">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
