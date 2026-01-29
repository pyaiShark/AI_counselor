
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Title, Text } from '../components/tailus-ui/typography';
import UniversityCard from '../components/UniversityCard';
import { getUniversityRecommendations, evaluateUniversity, shortlistAction } from '../api';
import Loader from '../components/Loader';
import { Lock } from 'lucide-react';

const UniversityShortlisting = () => {
    const navigate = useNavigate();
    // displayedRecommendations: What the user sees on the screen
    const [displayedRecommendations, setDisplayedRecommendations] = useState({ Dream: [], Target: [], Safe: [] });
    // buffer: Items fetched from server but not yet displayed
    const [buffer, setBuffer] = useState({ Dream: [], Target: [], Safe: [] });

    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [lockedUniversities, setLockedUniversities] = useState([]);
    const [error, setError] = useState(null);
    const [lockMessage, setLockMessage] = useState(null);
    const observer = useRef();

    const fetchNextBatch = useCallback(async (pageNum) => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            // Fetch 12 items per request for better server efficiency
            const response = await getUniversityRecommendations(pageNum, 12);
            if (response.data.status === 'success') {
                const newData = response.data.data;
                const pagination = response.data.pagination;

                setBuffer(prev => {
                    const merged = { ...prev };
                    ['Dream', 'Target', 'Safe'].forEach(cat => {
                        merged[cat] = [...prev[cat], ...(newData[cat] || [])];
                    });
                    return merged;
                });

                setHasMore(pagination?.has_next || false);
                setPage(pageNum);
            }
        } catch (err) {
            console.error("Failed to fetch recommendations", err);
            setError("Unable to generate recommendations.");
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore]);

    // Initial load: Fetch 12, Display 4, Buffer 8
    useEffect(() => {
        window.scrollTo(0, 0); // Ensure page starts at top
        const init = async () => {
            setLoading(true);
            try {
                const response = await getUniversityRecommendations(1, 12);
                if (response.data.status === 'success') {
                    const data = response.data.data;
                    const pagination = response.data.pagination;

                    const toDisplay = { Dream: [], Target: [], Safe: [] };
                    const toBuffer = { Dream: [], Target: [], Safe: [] };

                    let totalCount = 0;
                    ['Dream', 'Target', 'Safe'].forEach(cat => {
                        const items = data[cat] || [];
                        items.forEach(item => {
                            if (totalCount < 4) {
                                toDisplay[cat].push(item);
                                totalCount++;
                            } else {
                                toBuffer[cat].push(item);
                            }
                        });
                    });

                    setDisplayedRecommendations(toDisplay);
                    setBuffer(toBuffer);
                    setLockedUniversities(response.data.locked_universities || []);
                    setHasMore(pagination?.has_next || false);
                    setPage(1);
                }
            } catch (err) {
                setError("Initial load failed.");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Function to move items from buffer to display
    const loadFromBuffer = useCallback(() => {
        setDisplayedRecommendations(prev => {
            const nextDisplay = { ...prev };
            const nextBuffer = { ...buffer };
            let totalMoved = 0;

            ['Dream', 'Target', 'Safe'].forEach(cat => {
                const toMove = nextBuffer[cat].splice(0, Math.max(0, 4 - totalMoved));
                nextDisplay[cat] = [...nextDisplay[cat], ...toMove];
                totalMoved += toMove.length;
            });

            // Update buffer too
            setBuffer(nextBuffer);

            // Prefetch if low
            let remaining = nextBuffer.Dream.length + nextBuffer.Target.length + nextBuffer.Safe.length;
            if (remaining < 4 && hasMore && !loading) {
                fetchNextBatch(page + 1);
            }

            return nextDisplay;
        });
    }, [buffer, hasMore, loading, page, fetchNextBatch]);

    // Infinite Scroll Ref
    const lastElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                const bufferCount = buffer.Dream.length + buffer.Target.length + buffer.Safe.length;
                if (bufferCount > 0) {
                    loadFromBuffer();
                } else if (hasMore && !loading) {
                    fetchNextBatch(page + 1);
                }
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, buffer, loadFromBuffer, fetchNextBatch, page]);

    const handleLock = async (university, category) => {
        const isLocked = lockedUniversities.includes(university.name);

        // Add Warning for Unlocking
        if (isLocked) {
            const warning = `⚠️ UNLOCK WARNING\n\nAre you sure you want to unlock ${university.name}?\n\nThis will remove it from your shortlisted universities.`;
            if (!window.confirm(warning)) return;
        }

        const action = isLocked ? 'unlock' : 'lock';

        try {
            const response = await shortlistAction({
                action,
                university_name: university.name,
                category,
                country: university.country
            });

            if (response.status === 200 && response.data.status === 'success') {
                if (isLocked) {
                    setLockedUniversities(prev => prev.filter(name => name !== university.name));
                } else {
                    setLockedUniversities(prev => [...prev, university.name]);
                }
            } else if (response.data.status === 'error') {
                setLockMessage(response.data.message);
                setTimeout(() => setLockMessage(null), 5000);
            }

        } catch (err) {
            console.error("Lock action error", err);
            const msg = err.response?.data?.message || "Failed to update shortlist.";
            setLockMessage(msg);
            setTimeout(() => setLockMessage(null), 5000);
        }
    };

    const handleEvaluate = async (uniName) => {
        const response = await evaluateUniversity(uniName);
        return response.data.data;
    };

    const sections = [
        { title: 'Dream Universities', key: 'Dream', description: 'Ambitious but achievable. 15-20% acceptance chance.', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/10' },
        { title: 'Target Universities', key: 'Target', description: 'Good fit for your profile. 40-60% acceptance chance.', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/10' },
        { title: 'Safe Universities', key: 'Safe', description: 'High probability of acceptance. >80% chance.', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/10' }
    ];

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
            <div className="text-red-500 text-center space-y-4">
                <Text className="text-xl font-bold">{error}</Text>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-900 text-white rounded-lg">Retry</button>
            </div>
        </div>
    );

    // Full Page Loader for Initial Fetch (when no data is displayed)
    if (loading && displayedRecommendations.Dream.length === 0 && displayedRecommendations.Target.length === 0 && displayedRecommendations.Safe.length === 0) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-950/90 backdrop-blur-md transition-all">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-indigo-200 dark:border-indigo-900 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-24 h-24 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-3xl animate-bounce">🎓</div>
                </div>
                <div className="mt-8 text-center space-y-2">
                    <Title className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 animate-pulse">
                        Analyzing Your Profile
                    </Title>
                    <Text className="text-gray-500 dark:text-gray-400">
                        Our AI is curating the best university matches for you...
                    </Text>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-12 pt-24 md:pt-28 space-y-8 pb-32 transition-colors duration-500">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header Section */}
                <div className="relative overflow-hidden rounded-3xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl border border-white/20 dark:border-gray-800 shadow-2xl p-6 md:p-10 animate-fade-in">
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <Title className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-500">
                                University Shortlist
                            </Title>
                            <Text className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed">
                                AI-curated recommendations tailored to your profile. <span className="font-bold text-indigo-600 dark:text-indigo-400">Lock your top choices to unlock your application roadmap.</span>
                            </Text>
                        </div>

                        {/* Locked Counter */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="relative p-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg">
                                <div className="px-6 py-2 bg-white dark:bg-gray-900 rounded-full flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${lockedUniversities.length > 0 ? 'bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        Locked: {lockedUniversities.length}
                                    </span>
                                </div>
                            </div>
                            <Text size="xs" className="text-gray-500 uppercase tracking-widest font-bold">Max 10</Text>
                            <Link to="/shortlist" className="text-xs text-blue-600 hover:underline">View Locked</Link>
                        </div>
                    </div>
                </div>

                <div className="space-y-20">
                    {sections.map(section => (
                        <div key={section.key} className="space-y-8 relative group">
                            {/* Decorative Section Background */}
                            <div className={`absolute inset-0 ${section.bg} opacity-40 -mx-6 md:-mx-12 -my-8 rounded-[40px] -z-10 transition-all duration-700 group-hover:opacity-60`} />

                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200/50 dark:border-gray-800 pb-6 ml-2 md:ml-0">
                                <div className="space-y-1">
                                    <Title as="h2" size="3xl" className={`font-black tracking-tighter ${section.color}`}>{section.title}</Title>
                                    <Text className="text-gray-500 dark:text-gray-400 font-medium">{section.description}</Text>
                                </div>
                                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${section.bg.replace('/10', '/30')} ${section.color} border border-current/10 backdrop-blur-md`}>
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                                    </span>
                                    {displayedRecommendations[section.key]?.length || 0} Listed
                                </div>
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10 px-2 md:px-0">
                                {displayedRecommendations[section.key].map((uni, idx) => (
                                    <div
                                        key={uni.name + idx}
                                        className="h-full animate-fade-in-up"
                                        style={{ animationDelay: `${(idx % 4) * 100}ms` }}
                                    >
                                        <UniversityCard
                                            university={uni}
                                            isLocked={lockedUniversities.includes(uni.name)}
                                            onLock={(u) => handleLock(u, section.key)}
                                            onEvaluate={handleEvaluate}
                                        />
                                    </div>
                                ))}
                            </div>

                            {displayedRecommendations[section.key]?.length === 0 && !loading && (
                                <div className="p-16 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white/20 dark:bg-gray-900/20 text-center backdrop-blur-sm">
                                    <Text className="text-gray-400 font-medium">No {section.key.toLowerCase()} universities found in current selection.</Text>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Infinite Scroll Trigger & Loader */}
                    <div ref={lastElementRef} className="h-40 flex flex-col items-center justify-center gap-4 transition-all duration-300">
                        {loading ? (
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative w-12 h-12">
                                    <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
                                    <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 animate-spin"></div>
                                </div>
                                <Text className="text-purple-600 dark:text-purple-400 font-bold animate-pulse">Fetching AI Insights...</Text>
                            </div>
                        ) : hasMore || (buffer.Dream.length + buffer.Target.length + buffer.Safe.length > 0) ? (
                            <div className="w-1 h-12 bg-gradient-to-b from-gray-200 to-transparent dark:from-gray-800 rounded-full animate-bounce"></div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-8 grayscale opacity-50">
                                <div className="text-4xl">🎓</div>
                                <Text className="text-gray-500 font-bold uppercase tracking-tighter">End of Recommendations</Text>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="fixed bottom-0 left-0 right-0 p-8 flex flex-col items-center pointer-events-none z-50 gap-4">
                    {/* Lock Error Message */}
                    {lockMessage && (
                        <div className="pointer-events-auto flex items-center gap-3 px-6 py-3 bg-red-600/95 backdrop-blur-xl border border-red-400/50 text-white rounded-2xl shadow-2xl animate-fade-in-up">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="font-bold tracking-tight">{lockMessage}</span>
                        </div>
                    )}

                    <div className={`pointer-events-auto transition-all duration-500 transform ${lockedUniversities.length > 0 ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-20 scale-95 opacity-0'}`}>
                        <div className="p-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.1)]">
                            <button onClick={() => navigate('/shortlist')} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-4 rounded-full font-black text-xl flex items-center gap-4 hover:gap-6 hover:pr-8 group transition-all">
                                <span>Proceed to Applications</span>
                                <svg className="w-6 h-6 transform transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {lockedUniversities.length === 0 && (
                        <div className="pointer-events-auto absolute bottom-12 flex items-center gap-3 px-6 py-3 bg-red-500/90 dark:bg-red-600/90 backdrop-blur-xl border border-red-400/50 text-white rounded-full shadow-2xl animate-bounce-slow">
                            <Lock size={18} className="animate-pulse" />
                            <span className="font-bold tracking-tight">Lock at least one university to continue</span>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
                .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
                .animate-bounce-slow { animation: bounce-slow 2s infinite ease-in-out; }
            `}</style>
        </div>
    );
};

export default UniversityShortlisting;
