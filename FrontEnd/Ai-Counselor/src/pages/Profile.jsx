import React, { useState, useEffect } from 'react';
import Card from '@tailus-ui/Card';
import Button from '@tailus-ui/Button';
import { Title, Text, Caption } from '@tailus-ui/typography';
import {
    getProfile,
    submitAcademicBackground,
    submitStudyGoal,
    submitBudget,
    submitExamsReadiness
} from '../api';
import Loader from '../components/Loader';
import AcademicBackground from '../components/Onboarding/Steps/AcademicBackground';
import StudyGoal from '../components/Onboarding/Steps/StudyGoal';
import Budget from '../components/Onboarding/Steps/Budget';
import ExamsAndReadiness from '../components/Onboarding/Steps/ExamsAndReadiness';



const SectionCard = ({
    title,
    sectionKey,
    Component,
    dataDisplay,
    editingSection,
    handleEdit,
    handleCancel,
    handleSave,
    loading,
    formData,
    updateFormData
}) => {
    const isEditing = editingSection === sectionKey;

    return (
        <Card className="p-6 relative overflow-visible">
            <div className="flex justify-between items-start mb-4">
                <Title size="lg">{title}</Title>
                {!isEditing && (
                    <Button.Root size="xs" variant="outline" onClick={() => handleEdit(sectionKey)}>
                        <Button.Label>Edit</Button.Label>
                    </Button.Root>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-4 animate-fade-in">
                    <Component
                        formData={formData}
                        updateFormData={updateFormData}
                        // Reuse components but override navigation checks
                        onNext={handleSave}
                        // Disable skip/back for edit mode, or make them cancel
                        onSkip={handleCancel}
                        onBack={handleCancel}
                        loading={loading}
                        isEditing={true}
                    />
                    <div className="flex gap-2 justify-end mt-4 border-t pt-4">
                        <Button.Root variant="ghost" onClick={handleCancel} size="sm" disabled={loading}>
                            <Button.Label>Cancel</Button.Label>
                        </Button.Root>
                        <Button.Root onClick={handleSave} size="sm" disabled={loading}>
                            <Button.Label>{loading ? 'Saving...' : 'Save Changes'}</Button.Label>
                        </Button.Root>
                    </div>
                </div>
            ) : (
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {dataDisplay}
                </div>
            )}
        </Card>
    );
};

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState('');
    const [editingSection, setEditingSection] = useState(null);

    // Temp state for editing
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const data = await getProfile();

            // Map API response (nested snake_case) to frontend (flat camelCase)
            const mappedOnboardingData = {
                // Academic
                educationLevel: data.academic_background?.education_level || '',
                degreeMajor: data.academic_background?.degree_major || '',
                graduationYear: data.academic_background?.graduation_year || '',
                gpa: data.academic_background?.gpa || '',

                // Study Goal
                intendedDegree: data.study_goal?.intended_degree || '',
                fieldOfStudy: data.study_goal?.field_of_study || '',
                targetIntake: data.study_goal?.target_intake || '',
                preferredCountries: data.study_goal?.preferred_countries || '',

                // Budget
                budgetRange: data.budget?.budget_range || '',
                fundingPlan: data.budget?.funding_plan || '',

                // Exams
                ieltsToeflStatus: data.exams_readiness?.ielts_toefl_status || '',
                greGmatStatus: data.exams_readiness?.gre_gmat_status || '',
                sopStatus: data.exams_readiness?.sop_status || '',
                // Scores are not in DB models yet, so they will be empty/lost on refresh
                ieltsToeflScore: data.exams_readiness?.ielts_toefl_score || '',
                greGmatScore: data.exams_readiness?.gre_gmat_score || '',
            };

            const fullProfile = {
                ...data, // email, first_name etc
                onboarding_data: mappedOnboardingData
            };

            setProfileData(fullProfile);
            setFormData(mappedOnboardingData);
        } catch (err) {
            // console.error(err);
            setError('Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (section) => {
        setEditingSection(section);
        // Ensure formData is sync'd with current profile data before edit
        setFormData(profileData.onboarding_data || {});
    };

    const handleCancel = () => {
        setEditingSection(null);
        setFormData(profileData.onboarding_data || {});
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            if (editingSection === 'academic') {
                await submitAcademicBackground({
                    education_level: formData.educationLevel,
                    degree_major: formData.degreeMajor,
                    graduation_year: formData.graduationYear,
                    gpa: formData.gpa
                });
            } else if (editingSection === 'goals') {
                await submitStudyGoal({
                    intended_degree: formData.intendedDegree,
                    field_of_study: formData.fieldOfStudy,
                    target_intake: formData.targetIntake,
                    preferred_countries: formData.preferredCountries
                });
            } else if (editingSection === 'budget') {
                await submitBudget({
                    budget_range: formData.budgetRange,
                    funding_plan: formData.fundingPlan
                });
            } else if (editingSection === 'exams') {
                await submitExamsReadiness({
                    ielts_toefl_status: formData.ieltsToeflStatus,
                    ielts_toefl_score: formData.ieltsToeflScore,
                    gre_gmat_status: formData.greGmatStatus,
                    gre_gmat_score: formData.greGmatScore,
                    sop_status: formData.sopStatus
                });
            }

            // Refresh profile to get updated data and re-map
            await fetchProfile();
            setEditingSection(null);
        } catch (err) {
            // console.error(err);
            setError('Failed to update profile.');
            setLoading(false); // Only set loading false on error, success handled by fetchProfile
        }
    };

    const updateFormData = (newData) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    if (loading && !profileData) return <div className="flex justify-center p-20"><Loader /></div>;



    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex items-center gap-6 p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
                    {profileData?.first_name?.charAt(0) || 'U'}
                </div>
                <div>
                    <Title className="text-white text-3xl">{profileData?.first_name || 'User'} {profileData?.last_name || ''}</Title>
                    <Text className="text-blue-200">{profileData?.email || 'email@example.com'}</Text>
                    <Caption className="text-blue-300 mt-1">
                        Member since {profileData?.date_joined ? new Date(profileData.date_joined).toLocaleDateString() : '-'}
                    </Caption>
                </div>
            </div>

            {error && <div className="text-red-500 text-center">{error}</div>}

            <div className="grid grid-cols-1 gap-6">
                <SectionCard
                    title="Academic Background"
                    sectionKey="academic"
                    Component={AcademicBackground}
                    editingSection={editingSection}
                    handleEdit={handleEdit}
                    handleCancel={handleCancel}
                    handleSave={handleSave}
                    loading={loading}
                    formData={formData}
                    updateFormData={updateFormData}
                    dataDisplay={(
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="font-semibold block">Education Level:</span>
                                    {profileData?.onboarding_data?.educationLevel || '-'}
                                </div>
                                <div>
                                    <span className="font-semibold block">Major:</span>
                                    {profileData?.onboarding_data?.degreeMajor || '-'}
                                </div>
                                <div>
                                    <span className="font-semibold block">Grad Year:</span>
                                    {profileData?.onboarding_data?.graduationYear || '-'}
                                </div>
                                <div>
                                    <span className="font-semibold block">GPA:</span>
                                    {profileData?.onboarding_data?.gpa || '-'}
                                </div>
                            </div>
                        </>
                    )}
                />

                <SectionCard
                    title="Study Goals"
                    sectionKey="goals"
                    Component={StudyGoal}
                    editingSection={editingSection}
                    handleEdit={handleEdit}
                    handleCancel={handleCancel}
                    handleSave={handleSave}
                    loading={loading}
                    formData={formData}
                    updateFormData={updateFormData}
                    dataDisplay={(
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="font-semibold block">Target Degree:</span>
                                    {profileData?.onboarding_data?.intendedDegree || '-'}
                                </div>
                                <div>
                                    <span className="font-semibold block">Field:</span>
                                    {profileData?.onboarding_data?.fieldOfStudy || '-'}
                                </div>
                                <div>
                                    <span className="font-semibold block">Intake:</span>
                                    {profileData?.onboarding_data?.targetIntake || '-'}
                                </div>
                                <div>
                                    <span className="font-semibold block">Country:</span>
                                    {profileData?.onboarding_data?.preferredCountries || '-'}
                                </div>
                            </div>
                        </>
                    )}
                />

                <SectionCard
                    title="Budget & Funding"
                    sectionKey="budget"
                    Component={Budget}
                    editingSection={editingSection}
                    handleEdit={handleEdit}
                    handleCancel={handleCancel}
                    handleSave={handleSave}
                    loading={loading}
                    formData={formData}
                    updateFormData={updateFormData}
                    dataDisplay={(
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="font-semibold block">Budget Range:</span>
                                    {profileData?.onboarding_data?.budgetRange || '-'}
                                </div>
                                <div>
                                    <span className="font-semibold block">Funding Plan:</span>
                                    {profileData?.onboarding_data?.fundingPlan || '-'}
                                </div>
                            </div>
                        </>
                    )}
                />

                <SectionCard
                    title="Exams & Readiness"
                    sectionKey="exams"
                    Component={ExamsAndReadiness}
                    editingSection={editingSection}
                    handleEdit={handleEdit}
                    handleCancel={handleCancel}
                    handleSave={handleSave}
                    loading={loading}
                    formData={formData}
                    updateFormData={updateFormData}
                    dataDisplay={(
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="font-semibold block">IELTS/TOEFL:</span>
                                    {profileData?.onboarding_data?.ieltsToeflStatus || '-'}
                                    {profileData?.onboarding_data?.ieltsToeflScore && (
                                        <span className="text-gray-500 text-sm ml-1">({profileData.onboarding_data.ieltsToeflScore})</span>
                                    )}
                                </div>
                                <div>
                                    <span className="font-semibold block">GRE/GMAT:</span>
                                    {profileData?.onboarding_data?.greGmatStatus || '-'}
                                    {profileData?.onboarding_data?.greGmatScore && (
                                        <span className="text-gray-500 text-sm ml-1">({profileData.onboarding_data.greGmatScore})</span>
                                    )}
                                </div>
                                <div>
                                    <span className="font-semibold block">SOP Status:</span>
                                    {profileData?.onboarding_data?.sopStatus || '-'}
                                </div>
                            </div>
                        </>
                    )}
                />
            </div>
        </div>
    );
};

export default Profile;
