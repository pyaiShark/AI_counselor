import React from 'react';
import Card from '@tailus-ui/Card';
import Button from '@tailus-ui/Button';
import Input from '@tailus-ui/Input';
import Label from '@tailus-ui/Label';
import { Title, Text } from '@tailus-ui/typography';

const AcademicBackground = ({ formData, updateFormData, onNext, onSkip, loading }) => {
    const handleChange = (e) => {
        updateFormData({ [e.target.name]: e.target.value });
    };

    // Generate years from 2010 to current year
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2010 + 1 }, (_, i) => currentYear - i);

    const educationLevels = [
        "High School",
        "Bachelor's",
        "Master's",
        "Doctorate",
        "Other"
    ];

    // Placeholder for API data
    const commonMajors = [
        "Computer Science",
        "Business Administration",
        "Engineering",
        "Psychology",
        "Medicine / Health Sciences",
        "Law",
        "Social Sciences",
        "Arts & Humanities",
        "Natural Sciences",
        "Mathematics / Statistics",
        "Other"
    ];

    const isValid = formData.educationLevel &&
        (formData.educationLevel !== 'Other' || formData.educationLevelOther) &&
        formData.degreeMajor &&
        (formData.degreeMajor !== 'Other' || formData.degreeMajorOther) &&
        formData.graduationYear;

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <Title size="2xl" className="font-bold">Academic Background</Title>
                <Text className="text-gray-500">Tell us about your current education to help us find the best fit.</Text>
            </div>

            <Card className="p-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="educationLevel">Current Education Level <span className="text-red-500">*</span></Label>
                    <select
                        id="educationLevel"
                        name="educationLevel"
                        className="w-full rounded-[--btn-radius] border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900/50"
                        value={formData.educationLevel || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Level</option>
                        {educationLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </div>

                {formData.educationLevel === 'Other' && (
                    <div className="space-y-2 animate-fade-in-down">
                        <Label htmlFor="educationLevelOther">Specify Education Level <span className="text-red-500">*</span></Label>
                        <Input
                            id="educationLevelOther"
                            name="educationLevelOther"
                            placeholder="e.g. Diploma"
                            value={formData.educationLevelOther || ''}
                            onChange={handleChange}
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="degreeMajor">Degree / Major <span className="text-red-500">*</span></Label>
                    <select
                        id="degreeMajor"
                        name="degreeMajor"
                        className="w-full rounded-[--btn-radius] border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900/50"
                        value={formData.degreeMajor || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Major</option>
                        {commonMajors.map(major => (
                            <option key={major} value={major}>{major}</option>
                        ))}
                    </select>
                </div>

                {formData.degreeMajor === 'Other' && (
                    <div className="space-y-2 animate-fade-in-down">
                        <Label htmlFor="degreeMajorOther">Specify Major <span className="text-red-500">*</span></Label>
                        <Input
                            id="degreeMajorOther"
                            name="degreeMajorOther"
                            placeholder="e.g. Data Science"
                            value={formData.degreeMajorOther || ''}
                            onChange={handleChange}
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="graduationYear">Graduation Year <span className="text-red-500">*</span></Label>
                    <select
                        id="graduationYear"
                        name="graduationYear"
                        className="w-full rounded-[--btn-radius] border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900/50"
                        value={formData.graduationYear || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Year</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="gpa">GPA / Percentage <span className="text-gray-400">(Optional)</span></Label>
                    <Input
                        id="gpa"
                        name="gpa"
                        placeholder="e.g. 3.8 or 85%"
                        value={formData.gpa || ''}
                        onChange={handleChange}
                    />
                </div>
            </Card>

            <div className="flex justify-between items-center pt-4">
                <Button.Root variant="ghost" onClick={onSkip} disabled={loading}>
                    <Button.Label>Skip</Button.Label>
                </Button.Root>
                <Button.Root onClick={onNext} disabled={!isValid || loading} className={!isValid || loading ? "opacity-50 cursor-not-allowed" : ""}>
                    <Button.Label>{loading ? 'Saving...' : 'Next Step'}</Button.Label>
                </Button.Root>
            </div>
        </div>
    );
};

export default AcademicBackground;
