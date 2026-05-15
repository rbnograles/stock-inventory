/**
 * Captures or uploads an item photo through the browser's native file picker.
 * The selected image is normalized to a smaller JPEG data URL before it reaches
 * Supabase, which keeps mobile PWA saves fast and avoids huge request payloads
 * from modern phone cameras.
 */
import { useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";

interface CameraFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const MAX_PHOTO_EDGE = 1280;
const PHOTO_QUALITY = 0.82;

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read selected image."));
    reader.readAsDataURL(file);
  });

const loadImage = (dataUrl: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to prepare selected image."));
    image.src = dataUrl;
  });

const resizePhotoDataUrl = async (file: File) => {
  const originalDataUrl = await readFileAsDataUrl(file);

  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return originalDataUrl;
  }

  const image = await loadImage(originalDataUrl);
  const largestEdge = Math.max(image.naturalWidth, image.naturalHeight);

  if (!largestEdge || largestEdge <= MAX_PHOTO_EDGE) {
    return originalDataUrl;
  }

  const scale = MAX_PHOTO_EDGE / largestEdge;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);

  const context = canvas.getContext("2d");

  if (!context) {
    return originalDataUrl;
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", PHOTO_QUALITY);
};

export const CameraField = ({ value, onChange }: CameraFieldProps) => {
  const [error, setError] = useState("");

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    try {
      onChange(await resizePhotoDataUrl(file));
    } catch (photoError) {
      setError(photoError instanceof Error ? photoError.message : "Unable to prepare selected image.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="hs-field-label" htmlFor="item-photo">
          Item photo
        </label>
        {value ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
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
          <div className="flex h-56 flex-col items-center justify-center gap-2 hs-text-muted">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition group-hover:bg-teal-500 group-hover:text-white group-hover:ring-teal-400 dark:bg-slate-900 dark:ring-slate-700 dark:group-hover:bg-teal-500 dark:group-hover:ring-teal-400">
              <ImagePlus className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="text-sm font-bold hs-text-secondary">Add a photo</p>
            <p className="text-xs hs-text-muted">Tap to capture or upload</p>
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
      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </p>
      ) : null}
    </div>
  );
};
