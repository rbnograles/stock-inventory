/**
 * Displays short-lived feedback from app-level mutations. The shell owns timing
 * while this component keeps success and error notices accessible, dismissible,
 * and visually clear above the mobile bottom navigation.
 */
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export interface ToastMessage {
  id: number;
  title: string;
  detail?: string;
  tone?: "success" | "error";
}

interface ToastNotificationProps {
  message: ToastMessage | null;
  onDismiss: () => void;
}

export const ToastNotification = ({ message, onDismiss }: ToastNotificationProps) => {
  if (!message) {
    return null;
  }

  const isError = message.tone === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto max-w-xl px-4 pt-[max(1rem,env(safe-area-inset-top))]"
    >
      <div
        className={`pointer-events-auto flex items-start gap-3 rounded-3xl border bg-white/95 p-4 shadow-soft backdrop-blur dark:bg-slate-900/95 ${
          isError
            ? "border-rose-200 dark:border-rose-900/70"
            : "border-emerald-200 dark:border-emerald-900/70"
        }`}
      >
        <span
          className={`flex h-10 w-10 flex-none items-center justify-center rounded-2xl ${
            isError
              ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          }`}
        >
          {isError ? (
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold hs-text-primary">{message.title}</p>
          {message.detail ? (
            <p className="mt-0.5 break-words text-xs font-semibold hs-text-muted">{message.detail}</p>
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
