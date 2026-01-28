import React, { useEffect, useState } from 'react';
import Card from '@tailus-ui/Card';
import { Title, Text, Caption } from '@tailus-ui/typography';
import { getProfileStrength } from '../../api';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const ProfileStrength = () => {
    const [strengthData, setStrengthData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getProfileStrength();
                if (response.data.status === 'success') {
                    setStrengthData(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch profile strength", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Card className="p-4 h-full animate-pulse">
                <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                <div className="space-y-3">
                    <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
            </Card>
        );
    }

    if (!strengthData) return null;

    const getStatusColor = (status, type) => {
        const s = status?.toLowerCase();
        if (s === 'strong' || s === 'completed' || s === 'ready') return 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
        if (s === 'average' || s === 'in progress' || s === 'draft') return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
        return 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    };

    const metrics = [
        { label: "Academics", value: strengthData.academics },
        { label: "Exams Readiness", value: strengthData.exams },
        { label: "SOP Status", value: strengthData.sop },
    ];

    return (
        <Card className="p-4 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="size-5 text-blue-500" />
                <Title size="base" className="font-bold">Profile Strength (AI)</Title>
            </div>

            <div className="flex-1 space-y-3">
                {metrics.map((metric, idx) => (
                    <div key={idx} className={`flex flex-wrap items-center justify-between p-2.5 rounded-lg border gap-2 ${getStatusColor(metric.value)}`}>
                        <Text className="font-medium truncate mr-2 min-w-0 flex-1">{metric.label}</Text>
                        <div className="flex items-center gap-1.5 font-bold text-sm text-right">
                            {metric.value}
                            {metric.value?.toLowerCase().includes('strong') || metric.value?.toLowerCase().includes('completed') || metric.value?.toLowerCase().includes('ready') ?
                                <CheckCircle className="size-4" /> : <AlertCircle className="size-4" />}
                        </div>
                    </div>
                ))}
            </div>

            <Caption className="mt-4 text-center text-gray-400 text-xs">
                Analysis based on your current profile data
            </Caption>
        </Card>
    );
};

export default ProfileStrength;
