/**
 * Displays short-lived success feedback from app-level mutations. The shell
 * owns timing while this component keeps the toast accessible, dismissible, and
 * visually clear above the mobile bottom navigation.
 */
import { CheckCircle2, X } from "lucide-react";

export interface ToastMessage {
  id: number;
  title: string;
  detail?: string;
}

interface ToastNotificationProps {
  message: ToastMessage | null;
  onDismiss: () => void;
}

export const ToastNotification = ({ message, onDismiss }: ToastNotificationProps) => {
  if (!message) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto max-w-xl px-4 pt-[max(1rem,env(safe-area-inset-top))]"
    >
      <div className="pointer-events-auto flex items-start gap-3 rounded-3xl border border-emerald-200 bg-white/95 p-4 shadow-soft backdrop-blur dark:border-emerald-900/70 dark:bg-slate-900/95">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold hs-text-primary">{message.title}</p>
          {message.detail ? (
            <p className="mt-0.5 truncate text-xs font-semibold hs-text-muted">{message.detail}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
