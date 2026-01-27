import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Google } from './icons';
import Button from '@tailus-ui/Button';
import { Text, Link as UiLink, Caption, Title } from '@tailus-ui/typography';
import Input from '@tailus-ui/Input';
import Label from '@tailus-ui/Label';
import Separator from '@tailus-ui/Separator';
import Card from '@tailus-ui/Card';

import { register } from '../../api'; // Import register function
import Loader from '../Loader';
import FormError from '../FormError';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Placeholder navigation/state logic to match previous functionality
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register({
                email,
                password,
                first_name: firstname,
                last_name: lastname
            });
            navigate('/login');
        } catch (err) {
            console.log(`Register:---------${err}`);
            setError(err.response?.data?.error || 'Registration failed. Please check your inputs.');
            // Handle specific field errors if returned by DRF (usually strictly structured)
            if (err.response?.data && typeof err.response.data === 'object') {
                const firstError = Object.values(err.response.data)[0];
                if (Array.isArray(firstError)) {
                    setError(firstError[0]);
                }
            }
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <Title size="xl" weight="semibold" className="mb-2 text-blue-600 dark:text-blue-400 animate-pulse-gentle">
                            Create Account
                        </Title>

                        <Text className="my-0 text-gray-500" size="sm">
                            Join AI Counselor today
                        </Text>
                    </div>

                    <div className="mt-6">
                        <FormError message={error} />
                        <Button.Root
                            variant="outline"
                            intent="gray"
                            className="w-full justify-center gap-2"
                            onClick={() => window.location.href = 'http://127.0.0.1:8000/accounts/google/login/'}
                        >
                            <Button.Icon className="mr-0">
                                <Google />
                            </Button.Icon>
                            <Button.Label>Continue with Google</Button.Label>
                        </Button.Root>
                    </div>

                    <form onSubmit={handleSubmit} className="mx-auto mt-6 space-y-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 w-full">
                                <Separator className="flex-1" />

                                <Caption as="span" className="block text-gray-500" size="sm">
                                    Or
                                </Caption>

                                <Separator className="flex-1" />
                            </div>
                            <div className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2 sm:gap-3">
                                    <div className="space-y-2">
                                        <Label size="sm" htmlFor="firstname">
                                            First name
                                        </Label>
                                        <Input
                                            id="firstname"
                                            name="firstname"
                                            type="text"
                                            required
                                            variant="outlined"
                                            value={firstname}
                                            onChange={(e) => setFirstname(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label size="sm" htmlFor="lastname">
                                            Last name
                                        </Label>
                                        <Input
                                            id="lastname"
                                            name="lastname"
                                            type="text"
                                            required
                                            variant="outlined"
                                            value={lastname}
                                            onChange={(e) => setLastname(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label size="sm" htmlFor="email">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        variant="outlined"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label size="sm" htmlFor="password">
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        variant="outlined"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button.Root
                            intent="primary"
                            variant="solid"
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-400 hover:opacity-90 transition-all border-none"
                            disabled={loading}
                        >
                            <Button.Label>{loading ? <Loader size="sm" className="text-white" /> : 'Create Account'}</Button.Label>
                        </Button.Root>
                    </form>
                </div>

                <Card variant="soft" className="mt-0 rounded-b-[calc(var(--card-radius)-0.25rem)] border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 p-4 text-center">
                    <Caption className="my-0" size="sm" align="center">
                        Already have an account? {''}
                        <UiLink intent="neutral" size="sm" variant="underlined" href="/login">
                            Login
                        </UiLink>
                    </Caption>
                </Card>
            </Card>
        </main>
    );
}