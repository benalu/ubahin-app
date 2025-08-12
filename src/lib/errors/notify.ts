import { toast } from "sonner";
import {
  getErrorMessage,
  type ErrorCode,
  type ErrorContext,
  type ErrorMessage,
} from "./errorMessages";

function isErrorMessage(x: unknown): x is ErrorMessage {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return typeof o.title === "string" && typeof o.message === "string";
}

export function toastError(
  error: Error | string | ErrorCode | ErrorMessage,
  context?: ErrorContext
) {
  const msg = isErrorMessage(error) ? error : getErrorMessage(error, context);
  toast.error(msg.message, {
    description: msg.title,
    action: msg.action ? { label: msg.action, onClick: () => toast.dismiss() } : undefined,
    duration: 6000,
  });
}

export function toastSuccess(message: string, description?: string) {
  toast.success(message, { description });
}

export function toastInfo(message: string, description?: string) {
  toast.message(message, { description });
}

export function toastPromise<T>(
  promise: Promise<T>,
  opts: { loading: string; success: string; error: Error | string | ErrorCode | ErrorMessage },
  context?: ErrorContext
) {
  return toast.promise(promise, {
    loading: opts.loading,
    success: opts.success,
    error: (e) => {
      const resolved =
        isErrorMessage(opts.error) ? opts.error : getErrorMessage(opts.error ?? (e instanceof Error ? e : String(e)), context);
      return resolved.message;
    },
  });
}
