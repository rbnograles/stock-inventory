/**
 * Captures or uploads an item photo through the browser's native file picker.
 * Using the `capture` hint gives mobile devices a direct camera path, while
 * still supporting desktop testing and phones that restrict camera streams.
 */
import { Camera, ImageOff, X } from "lucide-react";

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800 dark:text-slate-100" htmlFor="item-photo">
          Item photo
        </label>
        {value ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-semibold text-rose-700 dark:text-rose-300"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Remove
          </button>
        ) : null}
      </div>
      {value ? (
        <img className="h-36 w-full rounded-lg object-cover" src={value} alt="Selected inventory item" />
      ) : (
        <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          <ImageOff className="h-8 w-8" aria-hidden="true" />
        </div>
      )}
      <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
        <Camera className="h-4 w-4" aria-hidden="true" />
        Capture photo
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
