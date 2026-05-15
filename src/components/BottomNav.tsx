/**
 * Keeps the primary mobile actions within thumb reach. The bottom bar exposes
 * dashboard, scan, and add as persistent commands so stock updates are fast
 * while standing in the kitchen or pantry.
 */
import { Barcode, Boxes, Plus } from "lucide-react";
import { Button, IconButton } from "@/lib/material";

interface BottomNavProps {
  onAdd: () => void;
  onScan: () => void;
}

export const BottomNav = ({ onAdd, onScan }: BottomNavProps) => (
  <nav
    aria-label="Primary actions"
    className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"
  >
    <div className="mx-auto grid max-w-xl grid-cols-[1fr_auto_1fr] items-center gap-3">
      <Button variant="text" className="flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200">
        <Boxes className="h-4 w-4" aria-hidden="true" />
        Stock
      </Button>
      <IconButton
        aria-label="Add inventory item"
        size="lg"
        className="h-14 w-14 rounded-full bg-teal-700 shadow-soft"
        onClick={onAdd}
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
      </IconButton>
      <Button
        variant="text"
        className="flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200"
        onClick={onScan}
      >
        <Barcode className="h-4 w-4" aria-hidden="true" />
        Scan
      </Button>
    </div>
  </nav>
);
