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
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Animate progress bar on mount
        const timer = setTimeout(() => {
            // Calculate percentage: (step index / total intervals) * 100
            const targetStep = Math.min(activeStep, 4);
            const percentage = ((targetStep - 1) / (steps.length - 1)) * 100;
            setProgress(Math.max(0, Math.min(percentage, 100)));
        }, 300);

        return () => clearTimeout(timer);
    }, [activeStep]);

    return (
        <div className="w-full py-4 md:py-8">
            {/* CONTAINER: Flex Column on Mobile (Vertical), Row on Desktop (Horizontal) */}
            <div className="relative flex flex-col md:flex-row justify-between w-full max-w-4xl mx-auto min-h-[300px] md:min-h-0">

                {/* ---------------- DRAWING THE LINES (Background & Active) ---------------- */}

                {/* DESKTOP LINES (Horizontal) */}
                <div className="hidden md:block absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full -z-10" />
                <div
                    className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 rounded-full -z-10 transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                />

                {/* MOBILE LINES (Vertical) */}
                <div className="md:hidden absolute top-0 bottom-0 left-5 w-1 bg-gray-200 dark:bg-gray-700 rounded-full -z-10 transform translate-x-1/2 my-4" />
                <div
                    className="md:hidden absolute top-0 left-5 w-1 bg-green-500 rounded-full -z-10 transform translate-x-1/2 transition-all duration-1000 ease-out my-4"
                    style={{ height: `${progress}%` }}
                />

                {/* ---------------- STEP ITEMS ---------------- */}
                {steps.map((step) => {
                    const isCompleted = step.id < activeStep;
                    const isCurrent = step.id === activeStep;
                    const isFuture = step.id > activeStep;

                    // CIRCLE STYLING
                    let circleClasses = "relative z-10 flex items-center justify-center rounded-full border-4 transition-all duration-500 delay-300 dark:bg-gray-900 shrink-0 ";

                    // Size
                    circleClasses += "w-12 h-12 ";

                    if (isCompleted) {
                        circleClasses += "bg-green-500 border-green-500 text-white scale-110";
                    } else if (isCurrent) {
                        circleClasses += "bg-white dark:bg-gray-900 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110";
                    } else if (isFuture) {
                        circleClasses += "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-300";
                    }

                    // LABEL STYLING
                    // Mobile: Left aligned next to circle
                    // Desktop: Absolute centered below circle
                    let labelClasses = "text-sm font-medium transition-all duration-300 ";

                    // Desktop positioning classes
                    const desktopPos = "md:absolute md:top-16 md:left-1/2 md:transform md:-translate-x-1/2 md:text-center md:whitespace-nowrap ";

                    // Mobile positioning classes (flex-1 to take space)
                    const mobilePos = "flex-1 md:flex-none md:w-auto ";

                    labelClasses += desktopPos + mobilePos;

                    if (isCurrent) {
                        labelClasses += "text-blue-700 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md transform md:-translate-y-1";
                    } else if (isCompleted) {
                        labelClasses += "text-green-600 dark:text-green-500";
                    } else {
                        labelClasses += "text-gray-400 dark:text-gray-500";
                    }

                    // NUMBER STYLING
                    const numberClass = isCurrent
                        ? "font-bold text-blue-600"
                        : (isCompleted ? "font-bold text-white" : "font-bold text-gray-400");

                    return (
                        <div key={step.id} className="relative flex md:flex-col items-center gap-6 md:gap-0 flex-1 py-2 md:py-0">
                            <div className={circleClasses}>
                                {isCompleted ? (
                                    <svg className="w-6 h-6 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
