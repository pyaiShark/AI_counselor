import React, { useEffect, useState } from 'react';

const steps = [
    { id: 1, label: 'Academic Background' },
    { id: 2, label: 'Study Goal' },
    { id: 3, label: 'Budget' },
    { id: 4, label: 'Exams & Readiness' },
];

const Timeline = ({ currentStep, status }) => {
    // If status is 'completed', all steps are completed (step 5 effectively for calculation)
    const activeStep = status === 'completed' ? 5 : currentStep;
    const [progressWidth, setProgressWidth] = useState(0);

    useEffect(() => {
        // Animate progress bar on mount
        const timer = setTimeout(() => {
            // Calculate percentage: (step index / total intervals) * 100
            const targetStep = Math.min(activeStep, 4);
            // Percentage calculation: (targetStep - 1) / (steps.length - 1) * 100
            // Step 1: 0%
            // Step 2: 33%
            // Step 3: 66%
            // Step 4: 100%
            const percentage = ((targetStep - 1) / (steps.length - 1)) * 100;
            setProgressWidth(Math.max(0, Math.min(percentage, 100)));
        }, 300);

        return () => clearTimeout(timer);
    }, [activeStep]);

    return (
        <div className="w-full py-8">
            <div className="relative flex items-center justify-between w-full max-w-4xl mx-auto">
                {/* Background Line */}
                <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full -z-10" />

                {/* Active Line (Progress) - Animated */}
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 rounded-full -z-10 transition-all duration-1000 ease-out"
                    style={{ width: `${progressWidth}%` }}
                />

                {steps.map((step) => {
                    const isCompleted = step.id < activeStep;
                    const isCurrent = step.id === activeStep;
                    const isFuture = step.id > activeStep;

                    // Dynamic classes for the step circle
                    let circleClasses = "w-10 h-10 rounded-full flex items-center justify-center border-4 z-10 transition-all duration-500 delay-300 ";
                    if (isCompleted) {
                        circleClasses += "bg-green-500 border-green-500 text-white scale-110";
                    } else if (isCurrent) {
                        // Changed to Blue for Current Step per user request - Removed animate-pulse
                        circleClasses += "bg-white dark:bg-gray-900 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110";
                    } else if (isFuture) {
                        circleClasses += "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-300";
                    }

                    // Dynamic classes for the label
                    let labelClasses = "absolute top-14 text-sm font-medium whitespace-nowrap px-2 py-1 rounded-md transition-all duration-300 ";
                    if (isCurrent) {
                        // Blue for Current
                        labelClasses += "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 transform -translate-y-1 font-bold";
                    } else if (isCompleted) {
                        labelClasses += "text-green-600 dark:text-green-500";
                    } else {
                        labelClasses += "text-gray-400 dark:text-gray-500";
                    }

                    // Dynamic classes for the number
                    const numberClass = isCurrent ? "font-bold text-blue-600" : (isCompleted ? "font-bold text-white" : "font-bold text-gray-400");

                    return (
                        <div key={step.id} className="relative flex flex-col items-center group">
                            <div className={circleClasses}>
                                {isCompleted ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className={numberClass}>
                                        {step.id}
                                    </span>
                                )}
                            </div>

                            {/* Label */}
                            <div className={labelClasses}>
                                {step.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Timeline;
