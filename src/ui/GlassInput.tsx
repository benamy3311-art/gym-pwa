import React from 'react';
import { cn } from '../utils/cn';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && <label className="text-sm font-medium text-secondary ml-1 tracking-wide">{label}</label>}
                <input
                    ref={ref}
                    className={cn(
                        'bg-glass-inset border border-black/20 text-primary placeholder:text-tertiary',
                        'backdrop-blur-md rounded-2xl p-3.5 shadow-inner-dark',
                        'transition-all duration-200 outline-none',
                        'focus:ring-2 focus:ring-accent/50 focus:border-accent/30 focus:bg-black/5',
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
