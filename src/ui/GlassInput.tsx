import React from 'react';
import { cn } from '../utils/cn';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
    ({ className, label, error, containerClassName, ...props }, ref) => {
        return (
            <div className={cn("flex flex-col gap-1.5 min-w-0", containerClassName)}>
                {label && <label className="text-sm font-medium text-[color:var(--text-secondary)] ml-1 tracking-wide">{label}</label>}
                <input
                    ref={ref}
                    className={cn(
                        'bg-[color:var(--glass-inset)] border border-[color:var(--glass-border)] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-tertiary)]',
                        'rounded-2xl p-3.5 w-full',
                        'transition-all duration-200 outline-none ios-body',
                        'focus:ring-2 focus:ring-[color:var(--accent)] focus:border-transparent',
                        error && 'border-red-500/50 focus:ring-red-500/50',
                        className
                    )}
                    {...props}
                />
                {error && <span className="text-xs text-red-400 ml-1">{error}</span>}
            </div>
        );
    }
);

GlassInput.displayName = 'GlassInput';
