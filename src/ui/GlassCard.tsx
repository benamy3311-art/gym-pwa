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
        base: 'bg-[color:var(--glass-base)] text-[color:var(--text-primary)]',
        elevated: 'bg-[color:var(--glass-elevated)] text-[color:var(--text-primary)]',
        inset: 'bg-[color:var(--glass-inset)] text-[color:var(--text-primary)]',
    };

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl p-4 md:p-6 transition-all duration-300',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
