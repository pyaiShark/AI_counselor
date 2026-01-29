import React, { useEffect, useState } from 'react';
import { Title, Text } from '../components/tailus-ui/typography';
import { getLockedUniversities } from '../api';
import { MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const LockedUniversities = () => {
    const [lockedList, setLockedList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-12 pt-24 md:pt-28 space-y-8">
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
                            <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                                    <button className="px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                        Start Application
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LockedUniversities;
