import { Outlet, NavLink } from 'react-router-dom';
import { Home, List, Clock, Dumbbell, PieChart } from 'lucide-react';
import { cn } from './GlassCard';

export default function Layout() {



    return (
        <div className="min-h-screen flex flex-col pb-20 md:pb-0 relative">
            <main className="flex-1 max-w-2xl w-full mx-auto p-4 flex flex-col pt-8">
                <Outlet />
            </main>

            {/* Liquid Glass Bottom Tab Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-[color:var(--glass-base)] border-t border-[color:var(--glass-border)] backdrop-blur-2xl pb-safe z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b [box-shadow:var(--shadow-md)] pt-1 pb-2 md:pb-1">
                <div className="max-w-2xl mx-auto flex items-center justify-around md:justify-center md:gap-8 px-2 pt-2">
                    <NavItem to="/" icon={<Home size={22} />} label="Start" />
                    <NavItem to="/templates" icon={<List size={22} />} label="Routines" />
                    <NavItem to="/exercises" icon={<Dumbbell size={22} />} label="Exercises" />
                    <NavItem to="/history" icon={<Clock size={22} />} label="History" />
                    <NavItem to="/analytics" icon={<PieChart size={22} />} label="Analytics" />
                </div>
            </nav>
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
