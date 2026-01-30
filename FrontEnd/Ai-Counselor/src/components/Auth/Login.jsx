import React, { useState, useContext, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '@tailus-ui/Card';
import Button from '@tailus-ui/Button';
import { Text, Link as UiLink, Caption, Title } from '@tailus-ui/typography';
import Input from '@tailus-ui/Input';
import Label from '@tailus-ui/Label';
import Separator from '@tailus-ui/Separator';
import { Google } from './icons';

import { login as apiLogin, getProfile } from '../../api';
import Loader from '../Loader';
import FormError from '../FormError';
import AuthContext from '../../context/AuthContext';
import { setToken } from '../../Auth';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Use AuthContext
    const { login } = useContext(AuthContext);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const access = searchParams.get('access');
        const refresh = searchParams.get('refresh');
        const urlError = searchParams.get('error');

        if (access && refresh) {
            handleGoogleLoginSuccess(access, refresh);
        } else if (urlError) {
            setError(urlError);
            navigate('/login', { replace: true });
        }
    }, [searchParams]);

    const handleGoogleLoginSuccess = async (access, refresh) => {
        setLoading(true);
        try {
            setToken(access, refresh);

            // Fetch profile to get name and onboarding status
            const profile = await getProfile();
            login(profile.first_name);

            if (profile.onboarding_step === 'Completed') {
                navigate('/dashboard');
            } else {
                navigate('/onboarding');
            }
        } catch (err) {
            setError('Google login failed to synchronize. Please try again.');
            // console.error(err);
        } finally {
            setLoading(false);
            // Clear tokens from URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await apiLogin(email, password);
            // Context handles state update and user setting if needed
            login(data.first_name);

            // Fetch profile to check onboarding status
            const profile = await getProfile();
            if (profile.onboarding_step === 'Completed') {
                navigate('/dashboard');
            } else {
                navigate('/onboarding');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative flex items-center justify-center min-h-screen px-4 py-12 animate-fade-in bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-40 dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.900),transparent)]" />

            <Card className="w-full max-w-sm p-1 shadow-xl shadow-gray-950/5 dark:shadow-gray-950/20 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-white/60 dark:border-gray-800" variant="mixed">
                <div data-rounded="large" className="p-8 sm:p-10">
                    <div className="text-center">
                        <div className="inline-block mb-4 animate-float">
                            <img src="/logo.png" alt="AI Counselor Logo" className="w-16 h-16 rounded-xl shadow-lg border-2 border-white/20" />
                        </div>
                        <Title size="xl" className="mb-2 text-blue-600 dark:text-blue-400 animate-pulse-gentle">
                            Welcome Back
                        </Title>
                        <Text className="my-0 text-gray-500" size="sm">
                            Sign in to continue your journey
                        </Text>
                    </div>

                    <div className="mt-6">
                        <FormError message={error} />
                        <Button.Root
                            variant="outline"
                            intent="gray"
                            size="sm"
                            className="flex w-full items-center justify-center"
                            onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/accounts/google/login/`}
                        >
                            <Button.Icon type="leading" size="xs">
                                <Google />
                            </Button.Icon>
                            <Button.Label>Continue with Google</Button.Label>
                        </Button.Root>
                    </div>

                    <form onSubmit={handleSubmit} className="mx-auto mt-8 space-y-6">
                        <div className="space-y-6 rounded-[--btn-radius]">
                            <div className="relative my-6 grid items-center gap-3 [grid-template-columns:1fr_auto_1fr]">
                                <Separator className="h-px border-b" />
                                <Caption as="span" className="block" size="sm">
                                    Or
                                </Caption>
                                <Separator className="h-px border-b" />
                            </div>

                            <div className="space-y-4">
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
                                        size="md"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label size="sm" htmlFor="password">
                                            Password
                                        </Label>
                                        <UiLink href="/forgot-password" size="sm" variant="default" className="text-xs text-blue-600 hover:text-blue-700">
                                            Forgot password?
                                        </UiLink>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            variant="outlined"
                                            size="md"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors p-1"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <EyeOff size={20} />
                                            ) : (
                                                <Eye size={20} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button.Root
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-400 hover:opacity-90 transition-all border-none"
                            intent="primary"
                            variant="solid"
                            disabled={loading}
                        >
                            <Button.Label>{loading ? <Loader size="sm" className="text-white" /> : 'Sign In'}</Button.Label>
                        </Button.Root>
                    </form>
                </div>

                <Card variant="soft" className="mt-0 rounded-b-[calc(var(--card-radius)-0.25rem)] border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 p-4 text-center">
                    <Caption className="my-0" size="sm" align="center">
                        Don't have an account?{' '}
                        <UiLink intent="neutral" size="sm" variant="underlined" href="/signup">
                            Create account
                        </UiLink>
                    </Caption>
                </Card>
            </Card>
        </main>
    );
}