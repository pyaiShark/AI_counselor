import { Github } from 'lucide-react';
import { Text, Caption, Link as UiLink } from '@tailus-ui/typography';
import Button from '@tailus-ui/Button';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-8 transition-colors duration-300">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <div className="flex flex-col items-center gap-4 sm:items-start">
                        <div className="flex items-center gap-2">
                            <div className="relative h-8 w-8">
                                <img
                                    src="/image.png"
                                    alt="AI Counselor Logo"
                                    className="object-contain w-full h-full"
                                />
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                AI Counselor
                            </span>
                        </div>
                        <Caption className="text-gray-500 dark:text-gray-400">
                            &copy; {currentYear} AI Counselor. All rights reserved.
                        </Caption>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button.Root
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                            href="https://github.com"
                            target="_blank"
                            rel="noreferrer"
                            as="a"
                        >
                            <Button.Icon>
                                <Github className="h-5 w-5" />
                            </Button.Icon>
                        </Button.Root>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
