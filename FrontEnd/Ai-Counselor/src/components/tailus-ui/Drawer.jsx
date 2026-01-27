import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

const Drawer = ({ open, onClose, children, className }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    if (!mounted) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className={twMerge(
                    "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
                    open ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div
                className={twMerge(
                    "fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white p-6 shadow-xl transition-transform duration-300 ease-in-out dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800",
                    open ? "translate-x-0" : "translate-x-full",
                    className
                )}
            >
                <div className="flex items-center justify-between mb-6">
                    <span className="text-lg font-semibold">Menu</span>
                    <button
                        onClick={onClose}
                        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100 focus:outline-none"
                    >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close menu</span>
                    </button>
                </div>
                {children}
            </div>
        </>,
        document.body
    );
};

export default Drawer;
