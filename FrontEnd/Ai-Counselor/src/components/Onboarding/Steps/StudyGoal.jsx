import React from 'react';
import Card from '@tailus-ui/Card';
import Button from '@tailus-ui/Button';
import Input from '@tailus-ui/Input';
import Label from '@tailus-ui/Label';
import { Title, Text } from '@tailus-ui/typography';

const StudyGoal = ({ formData, updateFormData, onNext, onBack, onSkip }) => {
    const handleChange = (e) => {
        updateFormData({ [e.target.name]: e.target.value });
    };

    const degrees = [
        "Bachelor's",
        "Master's",
        "MBA",
        "PhD",
        "Other"
    ];

    const countries = [
        "USA",
        "UK",
        "Canada",
        "Australia",
        "Germany",
        "Other"
    ];

    // Generate next 5 years
    const currentYear = new Date().getFullYear();
    const intakeYears = Array.from({ length: 5 }, (_, i) => currentYear + i);
    const seasons = ["Spring", "Summer", "Fall", "Winter"];

    // Generate combinations like "Fall 2026"
    const intakeOptions = [];
    intakeYears.forEach(year => {
        seasons.forEach(season => {
            intakeOptions.push(`${season} ${year}`);
        });
    });

    const isValid = formData.intendedDegree &&
        (formData.intendedDegree !== 'Other' || formData.intendedDegreeOther) &&
        formData.fieldOfStudy &&
        formData.targetIntake &&
        formData.preferredCountries &&
        (formData.preferredCountries !== 'Other' || formData.preferredCountriesOther);

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <Title size="2xl" className="font-bold">Study Goals</Title>
                <Text className="text-gray-500">What are you planning to pursue?</Text>
            </div>

            <Card className="p-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="intendedDegree">Intended Degree <span className="text-red-500">*</span></Label>
                    <select
                        id="intendedDegree"
                        name="intendedDegree"
                        className="w-full rounded-[--btn-radius] border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900/50"
                        value={formData.intendedDegree || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Degree</option>
                        {degrees.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                {formData.intendedDegree === 'Other' && (
                    <div className="space-y-2 animate-fade-in-down">
                        <Label htmlFor="intendedDegreeOther">Specify Degree <span className="text-red-500">*</span></Label>
                        <Input
                            id="intendedDegreeOther"
                            name="intendedDegreeOther"
                            placeholder="e.g. Associate Degree"
                            value={formData.intendedDegreeOther || ''}
                            onChange={handleChange}
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="fieldOfStudy">Field of Study <span className="text-red-500">*</span></Label>
                    <Input
                        id="fieldOfStudy"
                        name="fieldOfStudy"
                        placeholder="e.g. Artificial Intelligence"
                        value={formData.fieldOfStudy || ''}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="targetIntake">Target Intake <span className="text-red-500">*</span></Label>
                    <select
                        id="targetIntake"
                        name="targetIntake"
                        className="w-full rounded-[--btn-radius] border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900/50"
                        value={formData.targetIntake || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Intake</option>
                        {intakeOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="preferredCountries">Preferred Country <span className="text-red-500">*</span></Label>
                    <select
                        id="preferredCountries"
                        name="preferredCountries"
                        className="w-full rounded-[--btn-radius] border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900/50"
                        value={formData.preferredCountries || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Country</option>
                        {countries.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                {formData.preferredCountries === 'Other' && (
                    <div className="space-y-2 animate-fade-in-down">
                        <Label htmlFor="preferredCountriesOther">Specify Country <span className="text-red-500">*</span></Label>
                        <Input
                            id="preferredCountriesOther"
                            name="preferredCountriesOther"
                            placeholder="e.g. Netherlands"
                            value={formData.preferredCountriesOther || ''}
                            onChange={handleChange}
                        />
                    </div>
                )}
            </Card>

            <div className="flex justify-between items-center pt-4">
                <div className="flex gap-2">
                    <Button.Root variant="outline" onClick={onBack}>
                        <Button.Label>Back</Button.Label>
                    </Button.Root>
                    <Button.Root variant="ghost" onClick={onSkip}>
                        <Button.Label>Skip</Button.Label>
                    </Button.Root>
                </div>
                <Button.Root onClick={onNext} disabled={!isValid} className={!isValid ? "opacity-50 cursor-not-allowed" : ""}>
                    <Button.Label>Next Step</Button.Label>
                </Button.Root>
            </div>
        </div>
    );
};

export default StudyGoal;
