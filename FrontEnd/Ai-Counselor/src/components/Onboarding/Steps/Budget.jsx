import React from 'react';
import Card from '@tailus-ui/Card';
import Button from '@tailus-ui/Button';
import Input from '@tailus-ui/Input';
import Label from '@tailus-ui/Label';
import { Title, Text } from '@tailus-ui/typography';

const Budget = ({ formData, updateFormData, onNext, onBack, onSkip, loading, isEditing = false }) => {
    const handleChange = (e) => {
        updateFormData({ [e.target.name]: e.target.value });
    };

    const budgetRanges = [
        "< $10,000",
        "$10,000 - $20,000",
        "$20,000 - $30,000",
        "$30,000 - $40,000",
        "$40,000 - $50,000",
        "$50,000 - $60,000",
        "$60,000 - $70,000",
        "$70,000 - $80,000",
        "> $80,000"
    ];

    const fundingPlans = [
        "Self-funded",
        "Scholarship-dependent",
        "Loan-dependent"
    ];

    const isValid = formData.budgetRange && formData.fundingPlan;

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <Title size="2xl" className="font-bold">Budget & Funding</Title>
                <Text className="text-gray-500">Help us find universities that fit your financial plan.</Text>
            </div>

            <Card className="p-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="budgetRange">Budget Range (per year) <span className="text-red-500">*</span></Label>
                    <select
                        id="budgetRange"
                        name="budgetRange"
                        className="w-full rounded-[--btn-radius] border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900/50"
                        value={formData.budgetRange || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Budget Range</option>
                        {budgetRanges.map(range => (
                            <option key={range} value={range}>{range}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fundingPlan">Funding Plan <span className="text-red-500">*</span></Label>
                    <select
                        id="fundingPlan"
                        name="fundingPlan"
                        className="w-full rounded-[--btn-radius] border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900/50"
                        value={formData.fundingPlan || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Funding Plan</option>
                        {fundingPlans.map(plan => (
                            <option key={plan} value={plan}>{plan}</option>
                        ))}
                    </select>
                </div>
            </Card>

            {!isEditing && (
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
                        <Button.Label>{loading ? 'Saving...' : 'Next Step'}</Button.Label>
                    </Button.Root>
                </div>
            )}
        </div>
    );
};

export default Budget;
