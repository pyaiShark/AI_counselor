import React, { useState, useEffect } from 'react';
import Card from '@tailus-ui/Card';
import Button from '@tailus-ui/Button';
import { Title, Text, Caption } from '@tailus-ui/typography';
import { getProfile, updateProfile } from '../api';
import Loader from '../components/Loader';
import AcademicBackground from '../components/Onboarding/Steps/AcademicBackground';
import StudyGoal from '../components/Onboarding/Steps/StudyGoal';
import Budget from '../components/Onboarding/Steps/Budget';
import ExamsAndReadiness from '../components/Onboarding/Steps/ExamsAndReadiness';

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
            setProfileData(data);
            // Initialize local formData with fetched data for editing
            setFormData(data.onboarding_data || {});
        } catch (err) {
            setError('Failed to load profile.');
            // Fallback for demo if API fails/doesn't exist yet
            const savedData = localStorage.getItem('onboarding_data');
            if (savedData) {
                setProfileData({
                    first_name: 'Demo User',
                    email: 'demo@example.com',
                    created_at: new Date().toISOString(),
                    onboarding_data: JSON.parse(savedData)
                });
                setFormData(JSON.parse(savedData));
            }
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
            // Merge new form data into profile data structure
            const updatedProfile = {
                ...profileData,
                onboarding_data: formData
            };

            await updateProfile(updatedProfile);
            setProfileData(updatedProfile);
            setEditingSection(null);

            // Also update localStorage to keep sync
            localStorage.setItem('onboarding_data', JSON.stringify(formData));
        } catch (err) {
            setError('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (newData) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    if (loading && !profileData) return <div className="flex justify-center p-20"><Loader /></div>;

    const SectionCard = ({ title, sectionKey, Component, dataDisplay }) => {
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
                            // Prop mocks for reusable components
                            onNext={handleSave}
                            onSkip={handleCancel}
                            onBack={handleCancel}
                        />
                        <div className="flex gap-2 justify-end mt-4 border-t pt-4">
                            <Button.Root variant="ghost" onClick={handleCancel} size="sm">
                                <Button.Label>Cancel</Button.Label>
                            </Button.Root>
                            <Button.Root onClick={handleSave} size="sm">
                                <Button.Label>Save Changes</Button.Label>
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
                        Member since {new Date(profileData?.date_joined).toLocaleDateString()}
                    </Caption>
                </div>
            </div>

            {error && <div className="text-red-500 text-center">{error}</div>}

            <div className="grid grid-cols-1 gap-6">
                <SectionCard
                    title="Academic Background"
                    sectionKey="academic"
                    Component={AcademicBackground}
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
                    dataDisplay={(
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="font-semibold block">IELTS/TOEFL:</span>
                                    {profileData?.onboarding_data?.ieltsToeflStatus}
                                    {profileData?.onboarding_data?.ieltsToeflScore && ` (${profileData.onboarding_data.ieltsToeflScore})`}
                                </div>
                                <div>
                                    <span className="font-semibold block">GRE/GMAT:</span>
                                    {profileData?.onboarding_data?.greGmatStatus}
                                    {profileData?.onboarding_data?.greGmatScore && ` (${profileData.onboarding_data.greGmatScore})`}
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
