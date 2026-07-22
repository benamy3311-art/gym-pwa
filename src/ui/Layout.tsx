import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, List, Clock, Dumbbell, PieChart } from 'lucide-react';
import { cn } from './GlassCard';
import { Toaster } from './Toaster';
import { PwaUpdatePrompt } from './PwaUpdatePrompt';

export default function Layout() {
    // During an active workout the inputs summon the iOS keyboard; hide the bar there.
    const hideNav = useLocation().pathname === '/workout';

    return (
        // App-shell: fixed-height root, scrolling happens INSIDE <main> (not on the
        // body), and the tab bar is a normal flex child. That keeps it pinned to the
        // bottom instead of being a position:fixed element that lags / gets stuck
        // mid-screen during momentum scrolling on iOS.
        <div className="h-[100dvh] flex flex-col overflow-hidden relative">
            <Toaster />
            <PwaUpdatePrompt />

            <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full max-w-2xl mx-auto p-4 pt-8 flex flex-col md:order-last">
                <Outlet />
            </main>

            {!hideNav && (
                <nav className="shrink-0 bg-glass-inset border-t border-glass-base pb-safe md:order-first md:border-t-0 md:border-b">
                    <div className="max-w-2xl mx-auto flex items-center justify-around md:justify-center md:gap-8 px-2 pt-2 pb-2 md:pb-1">
                        <NavItem to="/" icon={<Home size={22} />} label="Start" />
                        <NavItem to="/templates" icon={<List size={22} />} label="Routines" />
                        <NavItem to="/exercises" icon={<Dumbbell size={22} />} label="Exercises" />
                        <NavItem to="/history" icon={<Clock size={22} />} label="History" />
                        <NavItem to="/analytics" icon={<PieChart size={22} />} label="Analytics" />
                    </div>
                </nav>
            )}
        </div>
    );
}

function NavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => cn(
                "flex flex-col items-center gap-1 p-2 transition-all duration-200 w-16 tap-highlight",
                isActive ? "text-[color:var(--accent)]" : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
            )}
        >
            {icon}
            <span className="ios-caption mt-1 font-medium">{label}</span>
        </NavLink>
    );
}
