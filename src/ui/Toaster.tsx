import { useUIStore } from '../store/uiStore';
import { GlassButton } from './GlassButton';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const TOAST_STYLES = {
    success: { icon: CheckCircle2, cls: 'border-green-500/30 text-green-400' },
    error: { icon: AlertTriangle, cls: 'border-red-500/30 text-red-400' },
    info: { icon: Info, cls: 'border-accent/30 text-accent' },
} as const;

export function Toaster() {
    const { toasts, dismissToast, confirm, resolveConfirm } = useUIStore();

    return (
        <>
            {/* Toasts */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
                {toasts.map(t => {
                    const { icon: Icon, cls } = TOAST_STYLES[t.type];
                    return (
                        <div
                            key={t.id}
                            onClick={() => dismissToast(t.id)}
                            className={`pointer-events-auto w-full flex items-center gap-2.5 bg-glass-elevated border ${cls} text-primary pl-4 pr-3 py-3 rounded-2xl shadow-glass animate-in slide-in-from-top-4 fade-in duration-200 ease-spring cursor-pointer`}
                        >
                            <Icon size={18} className="shrink-0" />
                            <span className="font-medium text-[14px] leading-snug flex-1">{t.message}</span>
                            <X size={16} className="shrink-0 text-tertiary" />
                        </div>
                    );
                })}
            </div>

            {/* Confirm dialog */}
            {confirm && (
                <div className="fixed inset-0 z-[210] bg-black/70 flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-glass-inset w-full max-w-sm rounded-[28px] p-6 flex flex-col gap-4 shadow-2xl animate-in zoom-in-95 duration-200 ease-spring">
                        {confirm.title && <h3 className="ios-h2 text-primary">{confirm.title}</h3>}
                        <p className="ios-body text-secondary leading-snug">{confirm.message}</p>
                        <div className="flex gap-3 mt-2">
                            <GlassButton
                                variant="ghost"
                                onClick={() => resolveConfirm(false)}
                                className="flex-1 rounded-2xl font-semibold"
                            >
                                {confirm.cancelText || 'Cancel'}
                            </GlassButton>
                            <GlassButton
                                variant={confirm.danger ? 'danger' : 'primary'}
                                onClick={() => resolveConfirm(true)}
                                className="flex-1 rounded-2xl font-semibold"
                            >
                                {confirm.confirmText || 'Confirm'}
                            </GlassButton>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
