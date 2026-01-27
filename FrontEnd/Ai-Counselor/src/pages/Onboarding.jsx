import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AcademicBackground from '../components/Onboarding/Steps/AcademicBackground';
import StudyGoal from '../components/Onboarding/Steps/StudyGoal';
import Budget from '../components/Onboarding/Steps/Budget';
import ExamsAndReadiness from '../components/Onboarding/Steps/ExamsAndReadiness';

const Onboarding = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        educationLevel: '',
        degreeMajor: '',
        graduationYear: '',
        gpa: '',
        intendedDegree: '',
        fieldOfStudy: '',
        targetIntake: '',
        preferredCountries: '',
        budgetRange: '',
        fundingPlan: '',
        ieltsToeflStatus: '',
        greGmatStatus: '',
        sopStatus: ''
    });

    // Load state from localStorage on mount
    useEffect(() => {
        const savedStep = localStorage.getItem('onboarding_step');
        const savedData = localStorage.getItem('onboarding_data');

        if (savedStep) setCurrentStep(parseInt(savedStep));
        if (savedData) setFormData(JSON.parse(savedData));
    }, []);

    // Save state to localStorage on change
    useEffect(() => {
        localStorage.setItem('onboarding_step', currentStep);
        localStorage.setItem('onboarding_data', JSON.stringify(formData));
    }, [currentStep, formData]);

    const updateFormData = (newData) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleFinish();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        // Mark as incomplete/skipped in localStorage (logic handled in Dashboard)
        localStorage.setItem('onboarding_status', 'skipped');
        navigate('/dashboard');
    };

    const handleFinish = () => {
        localStorage.setItem('onboarding_status', 'completed');
        navigate('/dashboard');
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <AcademicBackground
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={handleNext}
                        onSkip={handleSkip}
                    />
                );
            case 2:
                return (
                    <StudyGoal
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={handleNext}
                        onBack={handleBack}
                        onSkip={handleSkip}
                    />
                );
            case 3:
                return (
                    <Budget
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={handleNext}
                        onBack={handleBack}
                        onSkip={handleSkip}
                    />
                );
            case 4:
                return (
                    <ExamsAndReadiness
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={handleFinish}
                        onBack={handleBack}
                        onSkip={handleSkip}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-xl space-y-8">
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / 4) * 100}%` }}
                    ></div>
                </div>

                {renderStep()}
            </div>
        </div>
    );
};

export default Onboarding;
