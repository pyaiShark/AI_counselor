import React from 'react';
import Card from '@tailus-ui/Card';
import { Title, Text, Caption } from '@tailus-ui/typography';
import { Archive, GraduationCap, Globe, Wallet } from 'lucide-react';

const ProfileSummary = ({ profile }) => {
    if (!profile) return null;

    const { academic_background, study_goal, budget } = profile;

    const items = [
        {
            icon: <GraduationCap className="size-4 text-blue-500" />,
            label: "Education",
            value: academic_background ? `${academic_background.education_level} in ${academic_background.degree_major}` : "Not Set"
        },
        {
            icon: <Archive className="size-4 text-purple-500" />,
            label: "Target Intake",
            value: study_goal?.target_intake || "Not Set"
        },
        {
            icon: <Globe className="size-4 text-green-500" />,
            label: "Countries",
            value: study_goal?.preferred_countries || "Not Set"
        },
        {
            icon: <Wallet className="size-4 text-orange-500" />,
            label: "Budget",
            value: budget?.budget_range || "Not Set"
        }
    ];

    return (
        <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <Title size="lg" className="font-bold">Profile Summary</Title>
                <div className="px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-400">
                    Profile Complete
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {items.map((item, index) => (
                    <div key={index} className="flex flex-col p-3 border rounded-lg bg-gray-50/50 dark:bg-gray-900/20 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-1">
                            {item.icon}
                            <Caption className="text-gray-500">{item.label}</Caption>
                        </div>
                        <Text className="font-medium truncate" title={item.value}>
                            {item.value}
                        </Text>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default ProfileSummary;
