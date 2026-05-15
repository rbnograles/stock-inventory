/**
 * Provides narrow local exports for Material Tailwind components. The package
 * runtime works for this app, but its current React typings over-require a few
 * DOM event props, so this adapter keeps call sites clean while preserving the
 * library-backed Dialog, Button, Input, and Select primitives.
 */
import type { ComponentType } from "react";
import {
  Button as MaterialButton,
  Dialog as MaterialDialog,
  DialogBody as MaterialDialogBody,
  DialogFooter as MaterialDialogFooter,
  DialogHeader as MaterialDialogHeader,
  IconButton as MaterialIconButton,
  Input as MaterialInput,
  Option as MaterialOption,
  Select as MaterialSelect,
  Textarea as MaterialTextarea,
  ThemeProvider as MaterialThemeProvider,
} from "@material-tailwind/react";

type MaterialComponent<Props = Record<string, unknown>> = ComponentType<Props>;

export const Button = MaterialButton as unknown as MaterialComponent<Record<string, unknown>>;
export const Dialog = MaterialDialog as unknown as MaterialComponent<Record<string, unknown>>;
export const DialogBody = MaterialDialogBody as unknown as MaterialComponent<Record<string, unknown>>;
export const DialogFooter = MaterialDialogFooter as unknown as MaterialComponent<Record<string, unknown>>;
export const DialogHeader = MaterialDialogHeader as unknown as MaterialComponent<Record<string, unknown>>;
export const IconButton = MaterialIconButton as unknown as MaterialComponent<Record<string, unknown>>;
export const Input = MaterialInput as unknown as MaterialComponent<Record<string, unknown>>;
export const Option = MaterialOption as unknown as MaterialComponent<Record<string, unknown>>;
export const Select = MaterialSelect as unknown as MaterialComponent<Record<string, unknown>>;
export const Textarea = MaterialTextarea as unknown as MaterialComponent<Record<string, unknown>>;
export const ThemeProvider = MaterialThemeProvider as unknown as MaterialComponent<Record<string, unknown>>;
