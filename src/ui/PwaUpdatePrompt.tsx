import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw } from 'lucide-react';

// Shows a "new version available" banner when a newer build has been deployed.
// Tapping "Actualizar" activates the waiting service worker and reloads, so the
// user reliably lands on the latest code instead of a stale cached version.
export function PwaUpdatePrompt() {
    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(_swUrl, registration) {
            if (!registration) return;
            // Check for a new version now, hourly, and whenever the app regains focus,
            // so the banner appears promptly after a deploy.
            const check = () => registration.update().catch(() => {});
            check();
            setInterval(check, 60 * 60 * 1000);
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') check();
            });
            window.addEventListener('focus', check);
        },
    });

    if (!needRefresh) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[220] w-[calc(100%-2rem)] max-w-sm flex items-center gap-3 bg-glass-elevated border border-accent/40 text-primary pl-4 pr-2 py-2.5 rounded-2xl shadow-glass animate-in slide-in-from-top-4 fade-in duration-200 ease-spring">
            <RefreshCw size={18} className="text-accent shrink-0" />
            <span className="font-semibold text-[14px] leading-snug flex-1">Nueva versión disponible</span>
            <button
                onClick={() => updateServiceWorker(true)}
                className="shrink-0 bg-[color:var(--accent)] text-white font-semibold text-[13px] px-4 py-2 rounded-xl tap-highlight"
            >
                Actualizar
            </button>
        </div>
    );
}
