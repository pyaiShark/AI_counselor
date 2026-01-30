import React, { useEffect, useState } from 'react';
import { Title, Text } from '../components/tailus-ui/typography';
import { getLockedUniversities, shortlistAction, recordVisit } from '../api';
import { MapPin, Calendar, ArrowLeft, Unlock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const LockedUniversities = () => {
    const [lockedList, setLockedList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [modal, setModal] = useState(null); // { type: 'warning'|'info', title, message, onConfirm? }

    const handleUnlock = (university) => {
        setModal({
            type: 'warning',
            title: 'Remove University?',
            message: `Are you sure you want to remove ${university.university_name} from your Locked list?`,
            subMessage: "You will need to shortlist it again if you change your mind.",
            confirmText: "Yes, Remove",
            onConfirm: async () => {
                setModal(null); // Close modal
                setActionLoading(university.university_name);
                try {
                    const response = await shortlistAction({
                        action: 'unlock',
                        university_name: university.university_name,
                        category: university.category,
                        country: university.country
                    });

                    if (response.status === 200 && response.data.status === 'success') {
                        setLockedList(prev => prev.filter(u => u.university_name !== university.university_name));
                    }
                } catch (err) {
                    alert("Failed to unlock university."); // Fallback for error
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };

    const handleStartApplication = () => {
        setModal({
            type: 'info',
            title: 'Coming Soon! 🚀',
            message: "Thank you for your interest in starting your application.",
            subMessage: "This feature is currently in development. We are working hard to bring you the best application experience!",
            confirmText: "Got it",
            onConfirm: () => setModal(null)
        });
    };

    useEffect(() => {
        const fetchLocked = async () => {
            try {
                const response = await getLockedUniversities();
                if (response.data.status === 'success') {
                    setLockedList(response.data.data);
                }
            } catch (err) {
                setError("Failed to load locked universities.");
            } finally {
                setLoading(false);
            }
        };
        fetchLocked();
        recordVisit('shortlist');
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-12 pt-24 md:pt-28 space-y-8 relative">
            {/* Modal Overlay */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 border border-white/20 dark:border-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-6 transform animate-scale-in">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${modal.type === 'warning' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                            {modal.type === 'warning' ? <Unlock size={24} /> : <ExternalLink size={24} />}
                        </div>

                        <div className="text-center space-y-2">
                            <Title className="text-2xl font-bold dark:text-white">{modal.title}</Title>
                            <Text className="text-gray-600 dark:text-gray-300 font-medium">{modal.message}</Text>
                            {modal.subMessage && <Text size="sm" className="text-gray-400">{modal.subMessage}</Text>}
                        </div>

                        <div className="flex gap-3">
                            {modal.type === 'warning' && (
                                <button
                                    onClick={() => setModal(null)}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={modal.onConfirm}
                                className={`flex-1 px-4 py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${modal.type === 'warning'
                                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                                    }`}
                            >
                                {modal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-6">
                <Link to="/university-shortlist" className="inline-flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Back to Recommendations
                </Link>

                <div className="space-y-2">
                    <Title className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Your Locked Universities</Title>
                    <Text className="text-gray-500">These are the universities you have committed to applying to.</Text>
                </div>

                {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                {lockedList.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                        <Text className="text-gray-400 mb-4">You haven't locked any universities yet.</Text>
                        <Link to="/university-shortlist" className="text-blue-600 font-bold hover:underline">Browse Recommendations</Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {lockedList.map((uni, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{uni.university_name}</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${uni.category === 'Dream' ? 'bg-purple-100 text-purple-700' :
                                            uni.category === 'Target' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {uni.category}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-gray-500 text-sm gap-4">
                                        <span className="flex items-center gap-1"><MapPin size={14} /> {uni.country}</span>
                                        <span className="flex items-center gap-1"><Calendar size={14} /> Locked on {new Date(uni.locked_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUnlock(uni)}
                                        disabled={actionLoading === uni.university_name}
                                        className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Unlock size={16} />
                                        {actionLoading === uni.university_name ? 'Unlocking...' : 'Unlock'}
                                    </button>
                                    <button
                                        onClick={handleStartApplication}
                                        className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30"
                                    >
                                        Start Application <ExternalLink size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style>{`
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default LockedUniversities;

