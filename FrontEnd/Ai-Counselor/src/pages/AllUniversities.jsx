import React, { useState, useEffect } from 'react';
import { Title, Text } from '../components/tailus-ui/typography';
import { getAllUniversities, shortlistAction, evaluateUniversity, recordVisit } from '../api';
import UniversityCard from '../components/UniversityCard';
import { Search, Filter, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AllUniversities = () => {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [search, setSearch] = useState('');
    const [country, setCountry] = useState('');
    const [rankMin, setRankMin] = useState('');
    const [rankMax, setRankMax] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchUniversities = async () => {
        setLoading(true);
        try {
            const response = await getAllUniversities(page, 12, country, rankMin || 0, rankMax || 10000, debouncedSearch);
            if (response.data.status === 'success') {
                setUniversities(response.data.data);
                setTotalPages(response.data.pagination.total_pages);
            }
        } catch (error) {
            console.error("Failed to load universities", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchUniversities();
        recordVisit('explore');
    }, [page, country, rankMin, rankMax, debouncedSearch]);

    const handleLock = async (university) => {
        // Optimistic update
        setUniversities(prev => prev.map(u =>
            u.name === university.name ? { ...u, is_locked: !u.is_locked } : u
        ));

        try {
            const action = university.is_locked ? 'unlock' : 'lock';
            await shortlistAction({
                action,
                university_name: university.name,
                category: 'Target', // Default category for manual locks
                country: university.country
            });
        } catch (error) {
            console.error("Lock error", error);
            // Revert on error
            setUniversities(prev => prev.map(u =>
                u.name === university.name ? { ...u, is_locked: !u.is_locked } : u
            ));
        }
    };

    const handleEvaluate = async (uniName) => {
        const response = await evaluateUniversity(uniName);
        return response.data.data;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-12 pt-24 md:pt-28 space-y-8 pb-32">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div className="space-y-2">
                        <Title className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white">Explore Universities</Title>
                        <Text className="text-gray-500 text-lg">Browse the global database of top universities.</Text>
                    </div>
                    <Link to="/dashboard" className="text-blue-600 font-medium hover:underline flex items-center gap-2">
                        Back to Dashboard
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 grid md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="University name..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Country</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                            value={country}
                            onChange={(e) => { setCountry(e.target.value); setPage(1); }}
                        >
                            <option value="">All Countries</option>
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                            <option value="Germany">Germany</option>
                            <option value="France">France</option>
                            <option value="Netherlands">Netherlands</option>
                            <option value="China">China</option>
                            <option value="Japan">Japan</option>
                            <option value="New Zealand">New Zealand</option>
                            <option value="Switzerland">Switzerland</option>
                            <option value="Sweden">Sweden</option>
                            <option value="Spain">Spain</option>
                            <option value="Italy">Italy</option>
                            <option value="Ireland">Ireland</option>
                            <option value="Singapore">Singapore</option>
                            <option value="Malaysia">Malaysia</option>
                            <option value="Austria">Austria</option>
                            <option value="Denmark">Denmark</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Ranking Range</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Min"
                                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-sm"
                                value={rankMin}
                                onChange={(e) => { setRankMin(e.target.value); setPage(1); }}
                            />
                            <span className="self-center text-gray-400">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-sm"
                                value={rankMax}
                                onChange={(e) => { setRankMax(e.target.value); setPage(1); }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end h-full pb-1">
                        <span className="text-sm font-medium text-gray-500">
                            Showing page {page} of {totalPages}
                        </span>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : universities.length === 0 ? (
                    <div className="text-center py-20 bg-gray-100 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <Title size="xl" className="text-gray-400 font-bold">No universities found</Title>
                        <Text className="text-gray-500">Try adjusting your filters.</Text>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {universities.map((uni, idx) => (
                            <UniversityCard
                                key={uni.name + idx}
                                university={uni}
                                isLocked={uni.is_locked}
                                onLock={handleLock}
                                onEvaluate={handleEvaluate}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                <div className="flex justify-center items-center gap-4 pt-8">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-6 py-2 rounded-full bg-white dark:bg-gray-800 disabled:opacity-50 shadow-sm border border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Previous
                    </button>
                    <span className="font-bold text-gray-900 dark:text-white">Page {page}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-6 py-2 rounded-full bg-white dark:bg-gray-800 disabled:opacity-50 shadow-sm border border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AllUniversities;
