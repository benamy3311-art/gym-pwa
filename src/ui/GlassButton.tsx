import React from 'react';
import { cn } from '../utils/cn';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
    ({ children, className, variant = 'secondary', size = 'md', ...props }, ref) => {
        const variants = {
            primary: 'bg-[color:var(--accent)] hover:bg-[color:var(--accent-hover)] text-white',
            secondary: 'bg-[color:var(--glass-elevated)] hover:bg-[#48484A] text-[color:var(--text-primary)]',
            danger: 'bg-[#3A0A08] hover:bg-[#4A1210] text-[#FF453A]',
            ghost: 'bg-transparent hover:bg-[#2C2C2E] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]',
        };

        const sizes = {
            sm: 'py-1.5 px-3 text-sm rounded-[10px]',
            md: 'py-2.5 px-4 text-base rounded-[14px]',
            lg: 'py-3.5 px-6 text-lg rounded-[14px] font-semibold tracking-wide',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'tap-highlight relative overflow-hidden font-medium flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);

GlassButton.displayName = 'GlassButton';
