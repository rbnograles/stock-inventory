/**
 * Handles create and edit flows in one Material Tailwind dialog. The form keeps
 * all fields local until submit, which makes edits reversible and lets scanned
 * barcode/photo data flow into the draft without touching IndexedDB early.
 */
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, Input, Option, Select, Textarea } from "@/lib/material";
import { CameraField } from "@/components/CameraField";
import { EMPTY_DRAFT, INVENTORY_CATEGORIES, type InventoryDraft, type InventoryItem } from "@/types/inventory";

interface ItemFormDialogProps {
  open: boolean;
  barcode: string;
  item?: InventoryItem;
  onClose: () => void;
  onClearBarcode: () => void;
  onSubmit: (draft: InventoryDraft, item?: InventoryItem) => Promise<void>;
}

const itemToDraft = (item?: InventoryItem): InventoryDraft => {
  if (!item) {
    return EMPTY_DRAFT;
  }

  return {
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    barcode: item.barcode ?? "",
    location: item.location ?? "",
    expiryDate: item.expiryDate ?? "",
    notes: item.notes ?? "",
    photoDataUrl: item.photoDataUrl ?? "",
  };
};

export const ItemFormDialog = ({
  open,
  barcode,
  item,
  onClose,
  onClearBarcode,
  onSubmit,
}: ItemFormDialogProps) => {
  const [draft, setDraft] = useState<InventoryDraft>(EMPTY_DRAFT);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const title = item ? "Edit item" : "Add item";

  useEffect(() => {
    if (open) {
      setDraft({ ...itemToDraft(item), barcode: item?.barcode ?? barcode });
      setError("");
    }
  }, [barcode, item, open]);

  const isValid = useMemo(() => draft.name.trim().length > 0 && draft.quantity >= 0, [draft]);

  const updateDraft = <Key extends keyof InventoryDraft>(key: Key, value: InventoryDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValid) {
      setError("Item name and quantity are required.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await onSubmit(draft, item);
      onClearBarcode();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save item.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} handler={onClose} size="md" className="max-h-[92svh] overflow-y-auto bg-white dark:bg-slate-950">
      <form onSubmit={handleSubmit}>
        <DialogHeader className="text-slate-950 dark:text-white">{title}</DialogHeader>
        <DialogBody className="space-y-5">
          <Input
            crossOrigin=""
            label="Product name"
            aria-label="Product name"
            value={draft.name}
            onChange={(event: ChangeEvent<HTMLInputElement>) => updateDraft("name", event.target.value)}
            required
          />
          <div className="grid grid-cols-[1fr_112px] gap-3">
            <Input
              crossOrigin=""
              label="Quantity"
              aria-label="Quantity"
              type="number"
              min={0}
              step="0.01"
              value={draft.quantity}
              onChange={(event: ChangeEvent<HTMLInputElement>) => updateDraft("quantity", Number(event.target.value))}
              required
            />
            <Input
              crossOrigin=""
              label="Unit"
              aria-label="Unit"
              value={draft.unit}
              onChange={(event: ChangeEvent<HTMLInputElement>) => updateDraft("unit", event.target.value)}
            />
          </div>
          <Select
            label="Category"
            aria-label="Category"
            value={draft.category}
            onChange={(value: string | undefined) =>
              updateDraft("category", (value ?? "Other") as InventoryDraft["category"])
            }
          >
            {INVENTORY_CATEGORIES.map((category) => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              crossOrigin=""
              label="Barcode"
              aria-label="Barcode"
              value={draft.barcode}
              onChange={(event: ChangeEvent<HTMLInputElement>) => updateDraft("barcode", event.target.value)}
            />
            <Input
              crossOrigin=""
              label="Location"
              aria-label="Location"
              value={draft.location}
              onChange={(event: ChangeEvent<HTMLInputElement>) => updateDraft("location", event.target.value)}
            />
          </div>
          <Input
            crossOrigin=""
            label="Expiry date"
            aria-label="Expiry date"
            type="date"
            value={draft.expiryDate}
            onChange={(event: ChangeEvent<HTMLInputElement>) => updateDraft("expiryDate", event.target.value)}
          />
          <Textarea
            label="Notes"
            aria-label="Notes"
            value={draft.notes}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => updateDraft("notes", event.target.value)}
          />
          <CameraField value={draft.photoDataUrl} onChange={(value) => updateDraft("photoDataUrl", value)} />
          {error ? <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p> : null}
        </DialogBody>
        <DialogFooter className="sticky bottom-0 gap-2 bg-white dark:bg-slate-950">
          <Button variant="text" color="blue-gray" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button className="bg-teal-700" type="submit" disabled={!isValid || isSaving}>
            {isSaving ? "Saving..." : "Save item"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
