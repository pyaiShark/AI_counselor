import React from 'react';
import { useTheme } from './ThemeContext';
import { Moon, Sun } from 'lucide-react';
import Button from '@tailus-ui/Button';

const ThemeToggleButton = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button.Root
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-9 h-9 text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:text-sky-400 dark:hover:bg-sky-900/20 transition-colors"
            aria-label="Toggle theme"
        >
            <Button.Icon>
                {theme === 'light' ? (
                    <Moon className="h-4 w-4" />
                ) : (
                    <Sun className="h-4 w-4" />
                )}
            </Button.Icon>
        </Button.Root>
    );
};

export default ThemeToggleButton;
