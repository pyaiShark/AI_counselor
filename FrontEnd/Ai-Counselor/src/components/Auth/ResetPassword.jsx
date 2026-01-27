import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Card from '@tailus-ui/Card';
import Button from '@tailus-ui/Button';
import { Text, Title, Caption } from '@tailus-ui/typography';
import Input from '@tailus-ui/Input';
import Label from '@tailus-ui/Label';
import { resetPassword } from '../../api';
import Loader from '../Loader';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const uid = searchParams.get('uid');
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus({ type: 'error', message: 'Passwords do not match' });
            return;
        }

        if (!uid || !token) {
            setStatus({ type: 'error', message: 'Invalid reset link' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await resetPassword(password, uid, token);
            setStatus({ type: 'success', message: 'Password reset successfully!' });
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.error || 'Password reset failed. Link may be invalid or expired.'
            });
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <Title size="xl" weight="semibold" className="mb-2 text-blue-600 dark:text-blue-400 animate-pulse-gentle">
                            Reset Password
                        </Title>
                        <Text className="my-0 text-gray-500" size="sm">
                            Enter your new password below
                        </Text>
                    </div>

                    {status.message && (
                        <div className={`mt-6 mb-4 p-3 rounded-md text-sm text-center ${status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mx-auto mt-6 space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label size="sm" htmlFor="password">
                                    New Password
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
                            <div className="space-y-1.5">
                                <Label size="sm" htmlFor="confirmPassword">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    variant="outlined"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                            <Button.Label>{loading ? <Loader size="sm" className="text-white" /> : 'Reset Password'}</Button.Label>
                        </Button.Root>
                    </form>
                </div>
            </Card>
        </main>
    );
}
