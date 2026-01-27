import React from 'react';
import { Title, Text } from '../components/tailus-ui/typography';
import Button from '../components/tailus-ui/Button';
import { Link } from 'react-router-dom';

const AICounselor = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-4xl">
                    🤖
                </div>
                <Title size="3xl" className="font-bold">AI Counselor</Title>
                <Title size="xl" className="text-gray-500">Coming Soon</Title>
                <Text>
                    We are building a powerful AI agent to guide you through your study abroad journey.
                    Stay tuned for voice interaction and personalized recommendations!
                </Text>

                <Link to="/dashboard">
                    <Button.Root variant="outline">
                        <Button.Label>Back to Dashboard</Button.Label>
                    </Button.Root>
                </Link>
            </div>
        </div>
    );
};

export default AICounselor;
