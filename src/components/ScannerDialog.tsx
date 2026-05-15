/**
 * Runs a live barcode/QR scanner through ZXing when the device allows camera
 * access. It also includes a manual fallback so barcode entry still works on
 * browsers that deny camera streams or require HTTPS for device access.
 */
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { Barcode, Keyboard, VideoOff } from "lucide-react";
import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, Input } from "@/lib/material";

interface ScannerDialogProps {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

const hasCameraSupport = () =>
  typeof navigator !== "undefined" &&
  typeof navigator.mediaDevices !== "undefined" &&
  typeof navigator.mediaDevices.getUserMedia === "function";

export const ScannerDialog = ({ open, onClose, onScan }: ScannerDialogProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !videoRef.current) {
      return undefined;
    }

    if (!hasCameraSupport()) {
      setError(
        window.isSecureContext
          ? "This browser does not expose camera access. Enter the barcode manually below."
          : "Camera access requires a secure HTTPS connection. Enter the barcode manually below.",
      );
      return undefined;
    }

    let isMounted = true;
    const reader = new BrowserMultiFormatReader();
    const videoElement = videoRef.current;

    const startScanner = async () => {
      try {
        controlsRef.current = await reader.decodeFromVideoDevice(
          undefined,
          videoElement,
          (result) => {
            const text = result?.getText();

            if (text && isMounted) {
              controlsRef.current?.stop();
              onScan(text);
              onClose();
            }
          },
        );
      } catch (scanError) {
        if (isMounted) {
          setError(scanError instanceof Error ? scanError.message : "Camera scanner is unavailable.");
        }
      }
    };

    void startScanner();

    return () => {
      isMounted = false;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [onClose, onScan, open]);

  const submitManualCode = () => {
    const code = manualCode.trim();

    if (!code) {
      return;
    }

    onScan(code);
    setManualCode("");
    onClose();
  };

  const cameraAvailable = hasCameraSupport();

  return (
    <Dialog open={open} handler={onClose} size="sm" className="bg-white dark:bg-slate-950">
      <DialogHeader className="flex items-center gap-2 text-slate-950 dark:text-white">
        <Barcode className="h-5 w-5 text-teal-700 dark:text-teal-300" aria-hidden="true" />
        Scan barcode
      </DialogHeader>
      <DialogBody className="space-y-4">
        {cameraAvailable ? (
          <div className="overflow-hidden rounded-lg bg-slate-950">
            <video
              ref={videoRef}
              className="h-64 w-full object-cover"
              muted
              playsInline
              aria-label="Barcode scanner"
            />
          </div>
        ) : null}
        {error ? (
          <div className="flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
            <VideoOff className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : cameraAvailable ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Point your camera at a product barcode or QR code.
          </p>
        ) : null}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-100" htmlFor="manual-barcode">
            Enter barcode manually
          </label>
          <Input
            id="manual-barcode"
            crossOrigin=""
            icon={<Keyboard className="h-4 w-4" />}
            label="Barcode"
            aria-label="Barcode"
            value={manualCode}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setManualCode(event.target.value)}
          />
        </div>
      </DialogBody>
      <DialogFooter className="gap-2">
        <Button variant="text" color="blue-gray" onClick={onClose}>
          Cancel
        </Button>
        <Button className="bg-teal-700" onClick={submitManualCode}>
          Use code
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
