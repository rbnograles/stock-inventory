/**
 * Reusable confirmation modal. Drops in wherever the app would otherwise call
 * `window.confirm`, with proper dark-mode contrast and a destructive variant
 * for actions like deleting inventory items.
 */
import { useEffect } from "react";
import { AlertTriangle, HelpCircle, X } from "lucide-react";

type ConfirmTone = "danger" | "neutral";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

interface TonePalette {
  Icon: typeof AlertTriangle;
  accentStripe: string;
  iconHalo: string;
  iconBadge: string;
  iconColor: string;
  confirmButton: string;
}

const tonePalette: Record<ConfirmTone, TonePalette> = {
  danger: {
    Icon: AlertTriangle,
    accentStripe: "bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500",
    iconHalo: "bg-rose-100 dark:bg-rose-500/15",
    iconBadge: "bg-rose-500 dark:bg-rose-500 shadow-lg shadow-rose-500/30",
    iconColor: "text-white",
    confirmButton:
      "bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-400",
  },
  neutral: {
    Icon: HelpCircle,
    accentStripe: "bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500",
    iconHalo: "bg-teal-100 dark:bg-teal-500/15",
    iconBadge: "bg-teal-500 dark:bg-teal-500 shadow-lg shadow-teal-500/30",
    iconColor: "text-white",
    confirmButton:
      "bg-teal-600 text-white hover:bg-teal-500 active:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400",
  },
};

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "neutral",
  busy = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) => {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        onCancel();
      } else if (event.key === "Enter" && !busy) {
        onConfirm();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleKey);
    };
  }, [busy, onCancel, onConfirm, open]);

  if (!open) {
    return null;
  }

  const palette = tonePalette[tone];
  const Icon = palette.Icon;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <button
        type="button"
        aria-label="Dismiss"
        disabled={busy}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm disabled:cursor-not-allowed"
        onClick={() => !busy && onCancel()}
      />

      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-pop-in dark:border-slate-800 dark:bg-slate-900">
        <span aria-hidden="true" className={`block h-1.5 w-full ${palette.accentStripe}`} />

        <button
          type="button"
          aria-label="Close"
          disabled={busy}
          onClick={() => !busy && onCancel()}
          className="absolute right-3 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex flex-col items-center gap-3 px-6 pb-2 pt-7 text-center">
          <span className={`relative flex h-16 w-16 items-center justify-center rounded-full ${palette.iconHalo}`}>
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full ${palette.iconBadge}`}
            >
              <Icon className={`h-6 w-6 ${palette.iconColor}`} aria-hidden="true" />
            </span>
          </span>

          <h2
            id="confirm-dialog-title"
            className="text-xl font-extrabold text-slate-900 dark:text-white"
          >
            {title}
          </h2>
          <p
            id="confirm-dialog-message"
            className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300"
          >
            {message}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="h-11 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition active:scale-[0.98] hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`h-11 rounded-2xl text-sm font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${palette.confirmButton}`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
