import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@tailus-ui/Card';
import Button from '@tailus-ui/Button';
import { Text, Title } from '@tailus-ui/typography';

export default function ErrorPage({ title, message, code = 404 }) {
    const navigate = useNavigate();

    return (
        <main className="relative flex items-center justify-center min-h-screen px-4 py-12 animate-fade-in bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-40 dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.900),transparent)]" />

            <Card className="w-full max-w-lg p-1 shadow-2xl shadow-gray-950/10 dark:shadow-gray-950/40 bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl border-white/60 dark:border-gray-800" variant="mixed">
                <div className="p-8 sm:p-12 text-center">
                    <div className="relative inline-block mb-8">
                        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
                        <Title size="9xl" className="relative font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-200 opacity-20 select-none">
                            {code}
                        </Title>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img src="/logo.png" alt="AI Counselor Logo" className="w-24 h-24 rounded-2xl shadow-xl animate-float" />
                        </div>
                    </div>

                    <Title size="2xl" weight="bold" className="mb-3 text-gray-900 dark:text-white">
                        {title || "Oops! Something went wrong"}
                    </Title>

                    <Text className="mb-10 text-gray-500 dark:text-gray-400" size="lg">
                        {message || "We couldn't find the page you're looking for, or an unexpected error occurred. Don't worry, our AI is on the case!"}
                    </Text>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button.Root
                            onClick={() => navigate('/')}
                            className="bg-blue-600 hover:bg-blue-700 text-white border-none px-8 h-12"
                            variant="solid"
                        >
                            <Button.Label>Back to Home</Button.Label>
                        </Button.Root>

                        <Button.Root
                            onClick={() => window.location.reload()}
                            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 px-8 h-12"
                            variant="outlined"
                        >
                            <Button.Label>Retry Page</Button.Label>
                        </Button.Root>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
                        <Text size="sm" className="text-gray-400 italic">
                            Error Code: {code} | AI Counselor System
                        </Text>
                    </div>
                </div>
            </Card>
        </main>
    );
}
