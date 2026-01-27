import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/tailus-ui/Card';
import Button from '../components/tailus-ui/Button';
import { Title, Text } from '../components/tailus-ui/typography';
import Timeline from '../components/Dashboard/Timeline';

const quotes = [
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The only way to do great work is to love what you do. - Steve Jobs"
];

const Dashboard = () => {
    const [status, setStatus] = useState('incomplete');
    const [currentStep, setCurrentStep] = useState(1);
    const [randomQuote, setRandomQuote] = useState('');

    useEffect(() => {
        // In a real app, these would come from an API
        const onboardingStatus = localStorage.getItem('onboarding_status');
        const onboardingStep = localStorage.getItem('onboarding_step');

        setStatus(onboardingStatus || 'incomplete');
        setCurrentStep(parseInt(onboardingStep) || 1);
        setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);

        // Rotate quotes every 10 seconds
        const intervalId = setInterval(() => {
            setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
        }, 10000);

        return () => clearInterval(intervalId);
    }, []);

    const isCompleted = status === 'completed';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-12 pt-28 space-y-12">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Header Section with Glass Effect */}
                <div className="relative overflow-hidden rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 shadow-xl p-8 md:p-10">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-gradient-to-tr from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <Title size="3xl" className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                                Welcome Back!
                            </Title>
                            <Text className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                                Track your application journey and connect with your counselor.
                            </Text>
                        </div>
                        {isCompleted && (
                            <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-2 rounded-full border border-green-500/20 shadow-sm backdrop-blur-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="font-semibold">Profile Complete</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Onboarding Timeline Section */}
                {!isCompleted && (
                    <div className="space-y-8">
                        {/* Quote Banner */}
                        <div className="text-center space-y-2 py-4">
                            <Text className="text-xl md:text-2xl font-medium italic text-gray-700 dark:text-gray-300 font-serif">
                                "{randomQuote}"
                            </Text>
                            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full opacity-70" />
                        </div>

                        {/* Interactive Timeline Card */}
                        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200 dark:border-gray-800 shadow-xl overflow-visible">
                            <div className="p-8 space-y-8">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <Title size="xl" className="font-bold">Your Application Roadmap</Title>
                                        <Text className="text-gray-500 dark:text-gray-400 mt-1">Complete these steps to unlock full access.</Text>
                                    </div>
                                    <Link to="/onboarding">
                                        <Button.Root className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">
                                            <Button.Label>Continue Application &rarr;</Button.Label>
                                        </Button.Root>
                                    </Link>
                                </div>

                                <Timeline currentStep={currentStep} status={status} />
                            </div>
                        </Card>
                    </div>
                )}

                {/* Widgets Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Active Widget */}
                    <Link to="/ai-counselor" className="group block h-full">
                        <Card className="h-full p-8 space-y-5 border border-transparent hover:border-blue-500/30 bg-white dark:bg-gray-900 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full transition-transform group-hover:scale-110" />

                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                            </div>

                            <div>
                                <Title size="lg" className="font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">AI Counselor</Title>
                                <Text className="mt-2 text-gray-600 dark:text-gray-400">Your personal guide available 24/7. Get instant answers and tailored advice.</Text>
                            </div>

                            <div className="pt-4 flex items-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                                Start Chatting <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </div>
                        </Card>
                    </Link>

                    {/* Coming Soon Widget 1 */}
                    <Card className="p-8 space-y-5 bg-gray-50 dark:bg-gray-900/50 border-dashed border-2 border-gray-200 dark:border-gray-800 opacity-75 hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <div>
                            <Title size="lg" className="font-semibold text-gray-500">University Shortlist</Title>
                            <Text className="mt-2 text-gray-500">Curate your dream list of universities.</Text>
                        </div>
                        <div className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wider">
                            Coming Soon
                        </div>
                    </Card>

                    {/* Coming Soon Widget 2 */}
                    <Card className="p-8 space-y-5 bg-gray-50 dark:bg-gray-900/50 border-dashed border-2 border-gray-200 dark:border-gray-800 opacity-75 hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        </div>
                        <div>
                            <Title size="lg" className="font-semibold text-gray-500">Document Vault</Title>
                            <Text className="mt-2 text-gray-500">Securely store and manage your application docs.</Text>
                        </div>
                        <div className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wider">
                            Coming Soon
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
