import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Card from '@tailus-ui/Card';
import Button from '@tailus-ui/Button';
import { Text, Link as UiLink, Title, Caption } from '@tailus-ui/typography';
import Input from '@tailus-ui/Input';
import Label from '@tailus-ui/Label';

import { forgotPassword } from '../../api'; // Import forgotPassword function
import Loader from '../Loader';
import FormError from '../FormError';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await forgotPassword(email);
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative flex items-center justify-center min-h-screen px-3 py-7 animate-fade-in bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-100/40 to-transparent dark:from-indigo-900/20" />

            <Card variant="mixed" className="w-full max-w-sm p-1 shadow-xl shadow-gray-950/5 dark:shadow-gray-950/20 bg-white/20 dark:bg-gray-900/40 backdrop-blur-xl border-white/40 dark:border-gray-800">
                <div className="p-6 sm:p-8">
                    <div className="text-center">
                        <div className="inline-block p-3 bg-blue-100 rounded-full mb-4 animate-float">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <Title size="xl" weight="semibold" className="mb-2 text-blue-600 dark:text-blue-400 animate-pulse-gentle">
                            Forgot Password?
                        </Title>
                        <Text className="my-0 text-gray-500" size="sm">
                            {submitted ? "Check your email for instructions" : "Enter your email to reset your password"}
                        </Text>
                        <FormError message={error} />
                    </div>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="mx-auto mt-6 space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label size="sm" htmlFor="email">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        variant="outlined"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button.Root
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-400 hover:opacity-90 transition-all border-none"
                                intent="primary"
                                variant="solid"
                                disabled={loading}
                            >
                                <Button.Label>{loading ? <Loader size="sm" className="text-white" /> : 'Send Reset Link'}</Button.Label>
                            </Button.Root>
                        </form>
                    ) : (
                        <div className="mt-6 text-center">
                            <Button.Root
                                className="w-full bg-blue-100 text-blue-600 hover:bg-blue-200 border-none"
                                variant="solid"
                                onClick={() => setSubmitted(false)}
                            >
                                <Button.Label>Try another email</Button.Label>
                            </Button.Root>
                        </div>
                    )}
                </div>

                <Card variant="soft" className="mt-0 rounded-b-[calc(1rem-0.25rem)] border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 p-4 text-center">
                    <Caption className="my-0" size="sm" align="center">
                        Remember your password?{' '}
                        <RouterLink to="/login" className="text-sm font-medium text-gray-900 underline decoration-gray-900 underline-offset-2 hover:decoration-gray-700 dark:text-gray-100 dark:decoration-gray-100 dark:hover:decoration-gray-300">
                            Log in
                        </RouterLink>
                    </Caption>
                </Card>
            </Card>
        </main>
    );
}