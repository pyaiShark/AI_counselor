import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AcademicBackground from '../components/Onboarding/Steps/AcademicBackground';
import StudyGoal from '../components/Onboarding/Steps/StudyGoal';
import Budget from '../components/Onboarding/Steps/Budget';
import ExamsAndReadiness from '../components/Onboarding/Steps/ExamsAndReadiness';
import {
    getOnboardingStatus,
    submitAcademicBackground,
    getAcademicBackground,
    submitStudyGoal,
    getStudyGoal,
    submitBudget,
    getBudget,
    submitExamsReadiness,
    getExamsReadiness
} from '../api';
import FormError from '../components/FormError';

const Onboarding = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1); // Default to 1, updated by API
    const [loading, setLoading] = useState(false);
    const [fetchingStatus, setFetchingStatus] = useState(true);
    const [error, setError] = useState('');

    // We keep formData generic to hold all fields, but we update it via API calls on BACK navigation
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

    const stepMapping = {
        'AcademicBackground': 1,
        'StudyGoal': 2,
        'Budget': 3,
        'ExamsAndReadiness': 4,
        'Completed': 5
    };

    // 1. Initial Load: Get Status
    useEffect(() => {
        const fetchStatus = async () => {
            setFetchingStatus(true);
            try {
                const response = await getOnboardingStatus();
                // Response format: { status: 'success', data: { onboarding_step: '...' } }
                const stepName = response.data.onboarding_step;

                if (stepName === 'Completed') {
                    navigate('/dashboard');
                    return;
                }

                // If user is returning, stepName tells us where they LEFT OFF (e.g., 'StudyGoal')
                // So we should open that step.
                const step = stepMapping[stepName] || 1;
                setCurrentStep(step);

                // Should we fetch data for the current step on load? 
                // The requirements say "if user press back... get the saved data".
                // But if I land on Step 2 (StudyGoal), it means I completed Step 1.
                // It doesn't imply I have data for Step 2 yet.
                // However, if I am re-visiting, maybe I want to see what I filled?
                // Let's assume on load we just set the step. Data fetching is for "Back".

            } catch (err) {
                // console.error("Failed to fetch onboarding status:", err);
                setError('Failed to sync progress. Please refresh.');
            } finally {
                setFetchingStatus(false);
            }
        };

        fetchStatus();
    }, [navigate]);

    const updateFormData = (newData) => {
        setFormData(prev => ({ ...prev, ...newData }));
        if (error) setError('');
    };

    // Helper to fetch data for a specific step (used on Back)
    const fetchStepData = async (step) => {
        setLoading(true); // Re-use loading state nicely
        try {
            let data = null;
            if (step === 1) {
                const res = await getAcademicBackground();
                data = res.data; // { status: 'success', data: { ... } } -> res.data is the payload? 
                // Wait, views.py returns: {'status': 'success', 'data': serializer.data}
                // So api.js .data gives us that object.
                // So data = res.data
                if (data) {
                    setFormData(prev => ({
                        ...prev,
                        educationLevel: data.education_level || '',
                        degreeMajor: data.degree_major || '',
                        graduationYear: data.graduation_year || '',
                        gpa: data.gpa || ''
                    }));
                }
            } else if (step === 2) {
                const res = await getStudyGoal();
                data = res.data;
                if (data) {
                    setFormData(prev => ({
                        ...prev,
                        intendedDegree: data.intended_degree || '',
                        fieldOfStudy: data.field_of_study || '',
                        targetIntake: data.target_intake || '',
                        preferredCountries: data.preferred_countries || ''
                    }));
                }
            } else if (step === 3) {
                const res = await getBudget();
                data = res.data;
                if (data) {
                    setFormData(prev => ({
                        ...prev,
                        budgetRange: data.budget_range || '',
                        fundingPlan: data.funding_plan || ''
                    }));
                }
            } else if (step === 4) {
                const res = await getExamsReadiness();
                data = res.data;
                if (data) {
                    setFormData(prev => ({
                        ...prev,
                        ieltsToeflStatus: data.ielts_toefl_status || '',
                        greGmatStatus: data.gre_gmat_status || '',
                        sopStatus: data.sop_status || ''
                    }));
                }
            }
        } catch (err) {
            // console.warn(`Failed to fetch data for step ${step}`, err);
            // Non-blocking error, user can just re-enter data
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        setLoading(true);
        setError('');
        try {
            if (currentStep === 1) {
                await submitAcademicBackground({
                    education_level: formData.educationLevel,
                    degree_major: formData.degreeMajor,
                    graduation_year: formData.graduationYear,
                    gpa: formData.gpa
                });
            } else if (currentStep === 2) {
                await submitStudyGoal({
                    intended_degree: formData.intendedDegree,
                    field_of_study: formData.fieldOfStudy,
                    target_intake: formData.targetIntake,
                    preferred_countries: formData.preferredCountries
                });
            } else if (currentStep === 3) {
                await submitBudget({
                    budget_range: formData.budgetRange,
                    funding_plan: formData.fundingPlan
                });
            }

            // On success, backend updates status. Frontend just moves next locally to be snappy.
            if (currentStep < 4) {
                setCurrentStep(prev => prev + 1);
            } else {
                handleFinish();
            }
        } catch (err) {
            // console.error(err);
            setError(err.response?.data?.error || 'Failed to save progress. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = async () => {
        if (currentStep > 1) {
            const previousStep = currentStep - 1;
            setCurrentStep(previousStep);

            // Fetch data for the PREVIOUS step so user can edit it
            await fetchStepData(previousStep);
        }
    };

    const handleSkip = () => {
        // "Skip" button behavior: Redirect to Dashboard
        navigate('/dashboard');
    };

    const handleFinish = async () => {
        setLoading(true);
        setError('');
        try {
            await submitExamsReadiness({
                ielts_toefl_status: formData.ieltsToeflStatus,
                gre_gmat_status: formData.greGmatStatus,
                sop_status: formData.sopStatus
            });
            navigate('/dashboard');
        } catch (err) {
            // console.error(err);
            setError(err.response?.data?.error || 'Failed to complete.');
        } finally {
            setLoading(false);
        }
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
                        loading={loading}
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
                        loading={loading}
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
                        loading={loading}
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
                        loading={loading}
                    />
                );
            default:
                return null;
        }
    };

    if (fetchingStatus) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

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

                {error && <FormError message={error} />}

                {renderStep()}
            </div>
        </div>
    );
};

export default Onboarding;
