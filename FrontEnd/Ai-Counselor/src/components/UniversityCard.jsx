
import React, { useState } from 'react';
import Card from "@tailus-ui/Card";
import { Text, Title, Caption } from "@tailus-ui/typography";
import { MapPin, Lock, Unlock } from "lucide-react";
import Button from "@tailus-ui/Button";

const UniversityCard = ({ university, onLock, isLocked, onEvaluate }) => {
    const [evaluating, setEvaluating] = useState(false);
    const [evaluationData, setEvaluationData] = useState(null);

    const handleEvaluate = async () => {
        if (evaluationData) return; // Already evaluated
        setEvaluating(true);
        try {
            const data = await onEvaluate(university.name);
            setEvaluationData(data);
        } catch (error) {
            console.error("Evaluation failed", error);
        } finally {
            setEvaluating(false);
        }
    };

    return (
        <Card className={`relative flex flex-col h-full overflow-hidden transition-all duration-300 ${isLocked ? 'border-purple-500 shadow-purple-500/20 shadow-lg scale-[1.02]' : 'border-transparent hover:border-blue-500/30 hover:shadow-lg'}`}>
            {/* Lock Status Badge */}
            <div className={`absolute top-3 right-3 z-10 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md transition-colors ${isLocked ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/80 dark:bg-gray-900/80 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>
                {isLocked ? <><Lock size={10} /> LOCKED</> : <><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Rank #{university.rank || 'N/A'}</>}
            </div>

            <div className="relative h-48 w-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center p-6 group">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <img
                    src={university.logo || "/placeholder.svg"}
                    alt={university.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.svg"; }}
                />
            </div>

            <div className="p-5 flex-1 flex flex-col gap-4 bg-white dark:bg-gray-900">
                <div>
                    <Title as="h3" size="lg" className="font-bold leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {university.name}
                    </Title>
                    <div className="mt-2 flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                        <MapPin size={14} className="shrink-0" />
                        <span className="truncate">{university.country}</span>
                    </div>
                </div>

                {(university.why_it_fits || university.reason) ? (
                    <div className="mt-2 space-y-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 text-sm animate-fade-in-up">
                        <div className="space-y-1">
                            <Caption className="font-semibold text-gray-900 dark:text-white">Why it fits:</Caption>
                            <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                                {university.reason || (Array.isArray(university.why_it_fits) ? university.why_it_fits[0] : university.why_it_fits)}
                            </p>
                        </div>

                        {(university.risks || university.key_risks) && (
                            <div className="space-y-1 pt-1 border-t border-gray-200 dark:border-gray-700">
                                <Caption className="font-semibold text-red-600 dark:text-red-400 text-[10px] uppercase">Key Risks</Caption>
                                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                                    {university.risks || (Array.isArray(university.key_risks) ? university.key_risks[0] : university.key_risks)}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Cost</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">{university.cost || university.cost_level || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Chance</span>
                                <span className={`font-bold px-2 py-0.5 rounded text-xs w-fit ${university.acceptance_chance === 'High' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : university.acceptance_chance === 'Low' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                    {university.acceptance_chance || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : evaluationData ? (
                    <div className="mt-2 space-y-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 text-sm animate-fade-in-up">
                        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                            <span className="font-semibold text-gray-700 dark:text-gray-200">Fit Score</span>
                            <span className={`font-bold px-2 py-0.5 rounded text-xs ${evaluationData.fit_score === 'High' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>{evaluationData.fit_score}</span>
                        </div>
                        <div className="space-y-1">
                            <Caption className="font-semibold text-gray-900 dark:text-white">Match Reasons:</Caption>
                            <ul className="list-disc pl-4 text-gray-600 dark:text-gray-400 text-xs space-y-1">
                                {evaluationData.why_it_fits?.slice(0, 2).map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                        {/* Fallback for manually triggered evaluation */}
                    </div>
                ) : (
                    <div className="mt-auto pt-2">
                        <Button.Root
                            variant="ghost"
                            size="sm"
                            className="w-full justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 group"
                            onClick={handleEvaluate}
                            disabled={evaluating}
                        >
                            <Button.Label className="group-hover:translate-x-1 transition-transform">{evaluating ? 'Analyzing...' : 'View AI Analysis ->'}</Button.Label>
                        </Button.Root>
                    </div>
                )}

                <div className="mt-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button.Root
                        className={`w-full justify-center transition-all duration-300 ${isLocked ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 shadow-lg hover:shadow-xl'}`}
                        onClick={() => onLock(university)}
                    >
                        <Button.Icon type="leading">
                            {isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                        </Button.Icon>
                        <Button.Label>{isLocked ? 'Unlock University' : 'Lock University'}</Button.Label>
                    </Button.Root>
                </div>
            </div>
        </Card>
    );
};

export default UniversityCard;
