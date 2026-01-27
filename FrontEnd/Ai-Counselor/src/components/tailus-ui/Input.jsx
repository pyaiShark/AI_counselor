import React from 'react';
import { twMerge } from 'tailwind-merge';

const Input = React.forwardRef(({ className, variant = "outlined", ...props }, ref) => {
    const variants = {
        outlined: "bg-transparent border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
        soft: "bg-gray-100 border-transparent dark:bg-gray-800 focus:bg-white dark:focus:bg-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
    };

    return (
        <input
            ref={ref}
            className={twMerge(
                "flex h-10 w-full rounded-md px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                variants[variant],
                className
            )}
            {...props}
        />
    );
});

export default Input;
