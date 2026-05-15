/**
 * Captures or uploads an item photo through the browser's native file picker.
 * Using the `capture` hint gives mobile devices a direct camera path, while
 * still supporting desktop testing and phones that restrict camera streams.
 */
import { Camera, ImagePlus, X } from "lucide-react";

interface CameraFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read selected image."));
    reader.readAsDataURL(file);
  });

export const CameraField = ({ value, onChange }: CameraFieldProps) => {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onChange(await readFileAsDataUrl(file));
    event.target.value = "";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400"
          htmlFor="item-photo"
        >
          Item photo
        </label>
        {value ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
            onClick={() => onChange("")}
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Remove
          </button>
        ) : null}
      </div>

      <label
        htmlFor="item-photo"
        className="group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-teal-400 hover:bg-teal-50/40 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-teal-400 dark:hover:bg-teal-500/5"
      >
        {value ? (
          <>
            <img className="h-56 w-full object-cover" src={value} alt="Selected inventory item" />
            <span className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur dark:bg-slate-900/80 dark:text-slate-100">
              <Camera className="h-3.5 w-3.5" aria-hidden="true" />
              Replace photo
            </span>
          </>
        ) : (
          <div className="flex h-56 flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 group-hover:bg-teal-500 group-hover:text-white group-hover:ring-teal-400 dark:bg-slate-900 dark:ring-slate-700 dark:group-hover:bg-teal-500 dark:group-hover:ring-teal-400">
              <ImagePlus className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Add a photo</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tap to capture or upload</p>
          </div>
        )}
        <input
          id="item-photo"
          className="sr-only"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};
