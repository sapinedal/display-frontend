import React, { useEffect } from "react";
import { X } from "lucide-react";
import { motion } from "motion/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "custom";
  subtitle?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  subtitle,
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    custom: "w-[700px]"
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{
        default: { type: "spring", stiffness: 300, damping: 25 },
        opacity: { duration: 0.2, ease: "easeInOut" },
      }}
      className="fixed inset-0 z-40 overflow-y-auto"
    >
      {/* Overlay */}

      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay con blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-xs"
          onClick={onClose}
        />
        {/* Modal */}
        <div className="inline-block w-full text-left align-bottom transition-all sm:my-8 sm:align-middle sm:w-full">
          <div
            className={`relative mx-auto ${sizeClasses[size]} bg-white rounded-xl shadow-lg border border-gray-200`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {subtitle && (
              <div className="p-4 text-sm text-gray-500">{subtitle}</div>
            )}

            {/* Content */}
            <div className="px-6 py-6 bg-white rounded-b-xl">{children}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Modal;
