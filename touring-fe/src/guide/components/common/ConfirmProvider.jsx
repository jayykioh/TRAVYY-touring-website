// src/pages/components/common/ConfirmProvider.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog"; // <- đường dẫn này đúng khi file ở src/pages/components/common

const ConfirmCtx = createContext(null);

/**
 * Dùng:
 * const confirm = useConfirm();
 * const ok = await confirm({ title, description, confirmText, cancelText, variant: 'danger'|'success'|undefined });
 * if (ok) { ... }
 */
export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) {
    throw new Error("useConfirm must be used within <ConfirmProvider>");
  }
  return ctx.confirm;
}

export function ConfirmProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState({
    title: "",
    description: "",
    confirmText: "Xác nhận",
    cancelText: "Hủy",
    variant: undefined, // 'danger' | 'success' | undefined
  });

  // để resolve promise từ confirm()
  const [resolver, setResolver] = useState(() => () => {});

  const close = useCallback(() => setOpen(false), []);

  const onCancel = useCallback(() => {
    resolver(false);
    close();
  }, [resolver, close]);

  const onConfirm = useCallback(() => {
    resolver(true);
    close();
  }, [resolver, close]);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setResolver(() => resolve);
      setOpts((prev) => ({
        ...prev,
        title: options.title || "Xác nhận thao tác",
        description: options.description || "",
        confirmText: options.confirmText || "Xác nhận",
        cancelText: options.cancelText || "Hủy",
        variant: options.variant, // 'danger' | 'success' | undefined
      }));
      setOpen(true);
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  // mapping màu trực tiếp Tailwind (không qua biến primary)
  const confirmClasses =
    opts.variant === "danger"
      ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
      : "bg-[#02A0AA] hover:bg-[#02919A] focus:ring-[#02A0AA]"; // màu chủ đạo web

  return (
    <ConfirmCtx.Provider value={value}>
      {children}

      <AlertDialog open={open} onOpenChange={(v) => !v && onCancel()}>
        <AlertDialogContent className="max-w-md bg-white/95 backdrop-blur-xl border border-neutral-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-neutral-900">
              {opts.title}
            </AlertDialogTitle>
            {opts.description ? (
              <AlertDialogDescription className="text-sm text-neutral-500 pt-2">
                {opts.description}
              </AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full px-4 py-2 border border-gray-200 text-gray-900 hover:bg-gray-50">
              {opts.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              className={`rounded-full px-4 py-2 text-white focus:ring-2 focus:ring-offset-2 ${confirmClasses}`}
            >
              {opts.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmCtx.Provider>
  );
}
