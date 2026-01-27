import React, { useEffect, useState } from 'react';
import Card from '@tailus-ui/Card';
import { Title } from '@tailus-ui/typography';

const StageIndicator = ({ currentStage = 1 }) => {
    const stages = [
        { id: 1, label: "Building Profile" },
        { id: 2, label: "Discovering Universities" },
        { id: 3, label: "Finalizing Universities" },
        { id: 4, label: "Preparing Applications" }
    ];

    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Animate progress bar on mount
        const timer = setTimeout(() => {
            const targetStep = Math.min(currentStage, 4);
            const percentage = ((targetStep - 1) / (stages.length - 1)) * 100;
            setProgress(Math.max(0, Math.min(percentage, 100)));
        }, 300);

        return () => clearTimeout(timer);
    }, [currentStage]);

    return (
        <Card className="p-6 md:p-8 h-full">
            <Title size="lg" className="mb-6 font-bold text-center md:text-left">Application Stage</Title>

            {/* CONTAINER: Flex Column on Mobile (Vertical), Row on Desktop (Horizontal) */}
            <div className="relative flex flex-col md:flex-row justify-between w-full max-w-4xl mx-auto md:py-4 min-h-[300px] md:min-h-0">

                {/* ---------------- DRAWING THE LINES (Background & Active) ---------------- */}

                {/* DESKTOP LINES (Horizontal) */}
                <div className="hidden md:block absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full -z-10 bg-opacity-50 mx-4" />
                <div className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-500 rounded-full -z-10 transition-all duration-1000 ease-out mx-4"
                    style={{ width: `${progress}%` }}
                />

                {/* MOBILE LINES (Vertical) */}
                <div className="md:hidden absolute top-0 bottom-0 left-4 w-1 bg-gray-200 dark:bg-gray-700 rounded-full -z-10 transform translate-x-1/2 my-4" />
                <div className="md:hidden absolute top-0 left-4 w-1 bg-blue-500 rounded-full -z-10 transform translate-x-1/2 transition-all duration-1000 ease-out my-4"
                    style={{ height: `${progress}%` }}
                />

                {/* ---------------- STAGE ITEMS ---------------- */}
                {stages.map((stage) => {
                    const isCompleted = stage.id < currentStage;
                    const isCurrent = stage.id === currentStage;

                    // CIRCLE STYLING
                    let circleClasses = "relative z-10 flex items-center justify-center rounded-full border-4 transition-all duration-500 bg-white dark:bg-gray-900 shrink-0 ";

                    // Size: Smaller on mobile to fit nicely
                    circleClasses += "w-10 h-10 md:w-12 md:h-12 ";

                    if (isCompleted) {
                        circleClasses += "border-blue-500 text-blue-500";
                    } else if (isCurrent) {
                        circleClasses += "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110";
                    } else {
                        circleClasses += "border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600";
                    }

                    // FONT Styles
                    const numberClass = isCurrent
                        ? "font-bold text-blue-600"
                        : isCompleted
                            ? "font-bold text-blue-500"
                            : "font-bold text-gray-400 dark:text-gray-600";

                    const labelClass = `text-sm font-medium transition-colors duration-300 ${isCurrent
                        ? "text-blue-600 dark:text-blue-400 font-bold"
                        : isCompleted
                            ? "text-gray-600 dark:text-gray-400"
                            : "text-gray-500 dark:text-gray-500"
                        }`;

                    return (
                        <div key={stage.id} className="relative flex md:flex-col items-center gap-4 md:gap-0 flex-1">
                            {/* CIRCLE */}
                            <div className={circleClasses}>
                                {isCompleted ? (
                                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className={numberClass}>{stage.id}</span>
                                )}
                            </div>

                            {/* LABEL: Right of circle on Mobile, Below circle on Desktop */}
                            <div className={`md:absolute md:top-16 md:left-1/2 md:transform md:-translate-x-1/2 md:text-center flex-1 md:flex-none md:w-auto ${labelClass}`}>
                                {stage.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default StageIndicator;
