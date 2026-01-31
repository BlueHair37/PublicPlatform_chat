import React from 'react';

const MessageBubble = ({ sender, text, timestamp, isFirstInGroup }) => {
    const isBot = sender === 'bot';

    return (
        <div className={`flex items-start gap-2.5 ${!isBot ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            {isBot ? (
                <div className="bg-primary rounded-full size-9 flex items-center justify-center shrink-0 shadow-md">
                    <span className="material-symbols-outlined text-white text-[20px]">smart_toy</span>
                </div>
            ) : (
                <div className="bg-slate-300 rounded-full size-9 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    {/* Placeholder for user avatar - using a generic image or initials could be better, but matching design */}
                    <img
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgkDgJbYGlWRV8SF65IBdrBcxmMEkyI9asIHHWcXOrEYE0C0acA0_9xbnL4SWtgoGUh-NYd7TtDws1uVcPDNMJokiOpGFxReS6f_axdy5TKd5LuZQ7t1b64kgLNv7XUlgovEQNoQOxGg9kHKUmiREwbYunpFl2FhtnooyqheAPP9NaGVuE5AIA3h3K64s4aaVCl8w_NZd-tvt_YY2_YlYgy-xqRaMfZonbaoCRXbIOk_8yXGlmsNWXt-xedY5MyoZ4Ny5nTvMGbjpS"
                    />
                </div>
            )}

            <div className={`flex flex-col gap-1 max-w-[85%] ${!isBot ? 'items-end' : ''}`}>
                {/* Sender Name */}
                {isBot && isFirstInGroup && (
                    <span className="text-[11px] font-bold text-slate-500 ml-1">부산 AI 상담원</span>
                )}

                {/* Message Content */}
                <div
                    className={`
            p-3.5 rounded-2xl shadow-sm leading-relaxed text-[15px]
            ${isBot
                            ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
                            : 'bg-primary text-white rounded-tr-none shadow-md'
                        }
          `}
                    dangerouslySetInnerHTML={{ __html: text }}
                />

                {/* Timestamp */}
                {timestamp && (
                    <span className="text-[10px] text-slate-400">{timestamp}</span>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
