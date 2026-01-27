import React from 'react';
import { twMerge } from 'tailwind-merge';

const Label = React.forwardRef(({ className, size = "sm", ...props }, ref) => {
    const sizes = {
        sm: "text-sm",
        base: "text-base",
    };

    return (
        <label
            ref={ref}
            className={twMerge(
                "font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                sizes[size],
                "text-gray-900 dark:text-gray-100",
                className
            )}
            {...props}
        />
    );
});

export default Label;
