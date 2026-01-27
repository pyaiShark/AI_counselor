import React from 'react';
import { twMerge } from 'tailwind-merge';

const Separator = React.forwardRef(({ className, orientation = "horizontal", ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={twMerge(
                "shrink-0 bg-gray-200 dark:bg-gray-800",
                orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
                className
            )}
            {...props}
        />
    );
});

export default Separator;
