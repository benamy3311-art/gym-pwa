import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

export interface ConfirmOptions {
    message: string;
    title?: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
}

interface ConfirmRequest extends ConfirmOptions {
    id: string;
    resolve: (ok: boolean) => void;
}

interface UIState {
    toasts: Toast[];
    confirm: ConfirmRequest | null;
    queue: ConfirmRequest[];
    pushToast: (message: string, type?: ToastType) => void;
    dismissToast: (id: string) => void;
    requestConfirm: (opts: ConfirmOptions) => Promise<boolean>;
    resolveConfirm: (ok: boolean) => void;
}

const TOAST_MS = 3500;

export const useUIStore = create<UIState>((set, get) => ({
    toasts: [],
    confirm: null,
    queue: [],

    pushToast: (message, type = 'info') => {
        const id = crypto.randomUUID();
        set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
        window.setTimeout(() => get().dismissToast(id), TOAST_MS);
    },

    dismissToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

    requestConfirm: (opts) => new Promise<boolean>((resolve) => {
        const req: ConfirmRequest = { ...opts, id: crypto.randomUUID(), resolve };
        // Only one dialog shows at a time; extras queue so no promise is dropped.
        if (get().confirm) {
            set(s => ({ queue: [...s.queue, req] }));
        } else {
            set({ confirm: req });
        }
    }),

    resolveConfirm: (ok) => {
        const current = get().confirm;
        if (current) current.resolve(ok);
        const [next, ...rest] = get().queue;
        set({ confirm: next ?? null, queue: rest });
    },
}));

// Imperative helpers so non-React modules (e.g. cloud sync) can use them too.
export const toast = (message: string, type: ToastType = 'info') =>
    useUIStore.getState().pushToast(message, type);

export const confirmDialog = (opts: ConfirmOptions): Promise<boolean> =>
    useUIStore.getState().requestConfirm(opts);
