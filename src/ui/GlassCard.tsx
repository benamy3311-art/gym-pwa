import React from 'react';
import { cn } from '../utils/cn';

// Re-export cn for backward compatibility if other files import it from here
export { cn };

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: 'base' | 'elevated' | 'inset';
}

export function GlassCard({ children, className, variant = 'base', ...props }: GlassCardProps) {
    const variants = {
        base: 'bg-glass-base border-glass-border shadow-glass-sm backdrop-blur-xl',
        elevated: 'bg-glass-elevated border-glass-border shadow-glass backdrop-blur-xl ring-1 ring-white/10',
        inset: 'bg-black/10 border-black/20 shadow-inner-dark backdrop-blur-md',
    };

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-3xl p-4 md:p-6 transition-all duration-300',
                variants[variant],
                className
            )}
            {...props}
        >
            {/* Soft inner top-highlight for glass depth */}
            {variant !== 'inset' && (
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-inner-light" />
            )}
            {children}
        </div>
    );
}
