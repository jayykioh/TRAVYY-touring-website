import React from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";

/**
 * Reusable Modal Component for Admin Panel
 *
 * @param {boolean} isOpen - Control modal visibility
 * @param {function} onClose - Callback when modal is closed
 * @param {string} title - Modal title
 * @param {React.ReactNode} children - Modal content
 * @param {string} type - Modal type: 'confirm', 'success', 'warning', 'error', 'info'
 * @param {function} onConfirm - Callback for confirm button (optional)
 * @param {string} confirmText - Confirm button text (default: "Xác nhận")
 * @param {string} cancelText - Cancel button text (default: "Hủy")
 * @param {boolean} showCancel - Show cancel button (default: true)
 * @param {boolean} loading - Show loading state on confirm button
 * @param {string} size - Modal size: 'sm', 'md', 'lg', 'xl' (default: 'md')
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  type = "info",
  onConfirm,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  showCancel = true,
  loading = false,
  size = "md",
}) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const typeConfig = {
    confirm: {
      icon: AlertTriangle,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-100",
      buttonColor: "bg-yellow-600 hover:bg-yellow-700",
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      buttonColor: "bg-green-600 hover:bg-green-700",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
      buttonColor: "bg-orange-600 hover:bg-orange-700",
    },
    error: {
      icon: AlertCircle,
      iconColor: "text-red-600",
      iconBg: "bg-red-100",
      buttonColor: "bg-red-600 hover:bg-red-700",
    },
    info: {
      icon: Info,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop - Separate layer with high z-index */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md z-[999] animate-in fade-in duration-200"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="fixed inset-0 z-[1000] overflow-y-auto pointer-events-none">
        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4 pointer-events-none">
          <div
            className={`relative bg-white rounded-lg shadow-2xl ${sizeClasses[size]} w-full transform transition-all animate-in zoom-in-95 duration-200 pointer-events-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${config.iconBg}`}>
                  <Icon className={`w-6 h-6 ${config.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">{children}</div>

            {/* Footer */}
            {(onConfirm || showCancel) && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                {showCancel && (
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelText}
                  </button>
                )}
                {onConfirm && (
                  <button
                    onClick={onConfirm}
                    disabled={loading}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${config.buttonColor}`}
                  >
                    {loading && (
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                    {confirmText}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
