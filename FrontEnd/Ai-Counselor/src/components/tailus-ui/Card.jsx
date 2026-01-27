import React from 'react';
import { twMerge } from 'tailwind-merge';

const Card = React.forwardRef(({ className, variant = "mixed", ...props }, ref) => {
    const variants = {
        mixed: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm",
        soft: "bg-gray-50 dark:bg-gray-800/50",
        outlined: "border border-gray-200 dark:border-gray-800 bg-transparent",
    };

    return (
        <div
            ref={ref}
            className={twMerge(
                "rounded-xl",
                variants[variant],
                className
            )}
            {...props}
        />
    );
});

export default Card;
