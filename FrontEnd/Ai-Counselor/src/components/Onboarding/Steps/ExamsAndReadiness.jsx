import React from 'react';
import Card from '@tailus-ui/Card';
import Button from '@tailus-ui/Button';
import Input from '@tailus-ui/Input';
import Label from '@tailus-ui/Label';
import { Title, Text } from '@tailus-ui/typography';

const ExamsAndReadiness = ({ formData, updateFormData, onNext, onBack, onSkip, loading }) => {
    const handleChange = (e) => {
        updateFormData({ [e.target.name]: e.target.value });
    };

    const examStatuses = [
        "Not Taken",
        "Planning to take",
        "Taken"
    ];

    const sopStatuses = [
        "Not Started",
        "Draft Ready",
        "Completed"
    ];

    const isValid = formData.ieltsToeflStatus &&
        (formData.ieltsToeflStatus !== 'Taken' || formData.ieltsToeflScore) &&
        formData.greGmatStatus &&
        (formData.greGmatStatus !== 'Taken' || formData.greGmatScore) &&
        formData.sopStatus;

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <Title size="2xl" className="font-bold">Exams & Readiness</Title>
                <Text className="text-gray-500">How prepared are you with your exams and documents?</Text>
            </div>

            <Card className="p-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="ieltsToeflStatus">IELTS / TOEFL Status <span className="text-red-500">*</span></Label>
                    <select
                        id="ieltsToeflStatus"
                        name="ieltsToeflStatus"
                        className="w-full rounded-[--btn-radius] border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900/50"
                        value={formData.ieltsToeflStatus || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Status</option>
                        {examStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                {formData.ieltsToeflStatus === 'Taken' && (
                    <div className="space-y-2 animate-fade-in-down">
                        <Label htmlFor="ieltsToeflScore">Score <span className="text-red-500">*</span></Label>
                        <Input
                            id="ieltsToeflScore"
                            name="ieltsToeflScore"
                            placeholder="e.g. Band 7.5 or 100"
                            value={formData.ieltsToeflScore || ''}
                            onChange={handleChange}
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="greGmatStatus">GRE / GMAT Status <span className="text-red-500">*</span></Label>
                    <select
                        id="greGmatStatus"
                        name="greGmatStatus"
                        className="w-full rounded-[--btn-radius] border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900/50"
                        value={formData.greGmatStatus || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Status</option>
                        {examStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                {formData.greGmatStatus === 'Taken' && (
                    <div className="space-y-2 animate-fade-in-down">
                        <Label htmlFor="greGmatScore">Score <span className="text-red-500">*</span></Label>
                        <Input
                            id="greGmatScore"
                            name="greGmatScore"
                            placeholder="e.g. 320"
                            value={formData.greGmatScore || ''}
                            onChange={handleChange}
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="sopStatus">SOP Status <span className="text-red-500">*</span></Label>
                    <select
                        id="sopStatus"
                        name="sopStatus"
                        className="w-full rounded-[--btn-radius] border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900/50"
                        value={formData.sopStatus || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Status</option>
                        {sopStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </Card>

            <div className="flex justify-between items-center pt-4">
                <div className="flex gap-2">
                    <Button.Root variant="outline" onClick={onBack} disabled={loading}>
                        <Button.Label>Back</Button.Label>
                    </Button.Root>
                    <Button.Root variant="ghost" onClick={onSkip} disabled={loading}>
                        <Button.Label>Skip</Button.Label>
                    </Button.Root>
                </div>
                <Button.Root onClick={onNext} disabled={!isValid || loading} className={!isValid || loading ? "opacity-50 cursor-not-allowed" : ""}>
                    <Button.Label>{loading ? 'Saving...' : 'Finish Profile'}</Button.Label>
                </Button.Root>
            </div>
        </div>
    );
};

export default ExamsAndReadiness;
