import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Title = ({ size = "base", weight = "normal", align, className, children, ...props }) => {
    const sizes = {
        sm: "text-lg",
        base: "text-xl",
        lg: "text-2xl",
        xl: "text-3xl",
    };
    const weights = {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
    };

    return (
        <h2 className={twMerge(sizes[size], weights[weight], align && `text-${align}`, "text-gray-900 dark:text-gray-50", className)} {...props}>
            {children}
        </h2>
    );
};

export const Text = ({ size = "base", align, className, children, ...props }) => {
    const sizes = {
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
    };
    return (
        <p className={twMerge(sizes[size], align && `text-${align}`, "text-gray-600 dark:text-gray-400", className)} {...props}>
            {children}
        </p>
    );
};

export const Caption = ({ size = "xs", align, className, children, ...props }) => {
    return (
        <p className={twMerge("text-xs text-gray-500 dark:text-gray-500", align && `text-${align}`, className)} {...props}>
            {children}
        </p>
    );
};

export const Link = ({ variant = "default", size = "base", className, href, children, ...props }) => {
    const variants = {
        default: "text-blue-600 hover:underline",
        underlined: "underline underline-offset-4 hover:text-blue-800",
        neutral: "text-gray-900 underline hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-300",
    };

    return (
        <a href={href} className={twMerge(variants[variant], "font-medium", className)} {...props}>
            {children}
        </a>
    );
};
