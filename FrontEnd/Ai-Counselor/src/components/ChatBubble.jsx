import React from 'react';
import { Text } from './tailus-ui/typography';
import ReactMarkdown from 'react-markdown';

const ChatBubble = ({ message, sender, suggestedActions, onActionClick }) => {
    const isUser = sender === 'user';

    return (
        <div className={`flex flex-col mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
            <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                    }`}
            >
                <div className={`prose dark:prose-invert max-w-none text-sm leading-relaxed ${isUser ? 'text-white' : ''}`}>
                    {isUser ? (
                        <p>{message}</p>
                    ) : (
                        <ReactMarkdown>{message}</ReactMarkdown>
                    )}
                </div>
            </div>

            {/* Suggested Actions (Only for AI) */}
            {!isUser && suggestedActions && suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 ml-1">
                    {suggestedActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => onActionClick(action)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 rounded-full transition-colors border border-blue-200 dark:border-blue-800"
                        >
                            {action}
                        </button>
                    ))}
                </div>
            )}

            <span className="text-[10px] text-gray-400 mt-1 px-1">
                {sender === 'user' ? 'You' : 'AI Counselor'}
            </span>
        </div>
    );
};

export default ChatBubble;
