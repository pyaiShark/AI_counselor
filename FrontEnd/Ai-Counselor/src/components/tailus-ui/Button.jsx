import React from 'react';
import { cloneElement } from '@lib/utils';
import { twMerge } from 'tailwind-merge';

const Root = React.forwardRef(({ className, variant = "solid", intent = "primary", size = "md", children, ...props }, ref) => {
    const variants = {
        solid: "bg-blue-600 text-white hover:bg-blue-700",
        soft: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800",
        ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
    };

    const intents = {
        primary: "",
        gray: "",
        neutral: "bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100",
    };

    // Override generic variants with specific intent styles if needed
    const buttonClass = twMerge(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        "h-10 px-4 py-2", // Default size
        variants[variant],
        intent === 'neutral' && variant === 'solid' ? intents.neutral : '',
        className
    );

    return (
        <button ref={ref} className={buttonClass} {...props}>
            {children}
        </button>
    );
});

const Icon = ({ children, className, ...props }) => {
    return (
        <span className={twMerge("mr-2 h-4 w-4", className)} {...props}>
            {children}
        </span>
    );
};

const Label = ({ children, className, ...props }) => {
    return <span className={className} {...props}>{children}</span>;
};

export default { Root, Icon, Label };
