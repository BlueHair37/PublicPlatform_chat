import React from 'react';

const MessageBubble = ({ sender, text, timestamp, isFirstInGroup, type, imageFile, lat, lng }) => {
    const isBot = sender === 'bot';

    // Create Object URL for image preview
    const imageUrl = React.useMemo(() => {
        if (imageFile) return URL.createObjectURL(imageFile);
        return null; // Handle URL strings if passed as text later?
    }, [imageFile]);

    // Parse text content for cleaner display?
    // If type is image/location, we ignore 'text' generally if it's just metadata, 
    // but sometimes text contains the message. 
    // User requested: "Don't show filename". 
    // We only show text if type='text' or if it's a bot message.

    return (
        <div className={`flex items-start gap-2.5 ${!isBot ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            {isBot ? (
                <div className="bg-primary rounded-full size-9 flex items-center justify-center shrink-0 shadow-md">
                    <span className="material-symbols-outlined text-white text-[20px]">smart_toy</span>
                </div>
            ) : (
                <div className="bg-slate-300 rounded-full size-9 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
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
                {type === 'location' && lat && lng ? (
                    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 w-[240px]">
                        {/* Title Area */}
                        <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">현재 위치</p>
                                <p className="text-[10px] text-slate-500 truncate w-[140px]">{text || "부산광역시 어딘가"}</p>
                            </div>
                            <span className="material-symbols-outlined text-red-500 text-[20px]">location_on</span>
                        </div>
                        {/* Map Placeholder (Mock Visual) */}
                        <div className="h-[140px] bg-slate-200 relative overflow-hidden group">
                            {/* Mock Map Background Pattern */}
                            <div className="absolute inset-0 bg-[#e8ecf1] opacity-60"
                                style={{
                                    backgroundImage: 'linear-gradient(#dbe0e6 1px, transparent 1px), linear-gradient(90deg, #dbe0e6 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }}>
                            </div>
                            {/* Roads Mock */}
                            <div className="absolute top-[30%] left-0 w-full h-[8px] bg-white border-y border-slate-300 transform -rotate-12"></div>
                            <div className="absolute top-0 right-[30%] h-full w-[8px] bg-white border-x border-slate-300"></div>

                            {/* Pin */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pb-8">
                                <span className="material-symbols-outlined text-red-600 text-[40px] drop-shadow-md animate-bounce" style={{ animationDuration: '2s' }}>location_on</span>
                            </div>
                        </div>
                        {/* Action Button */}
                        <a
                            href={`https://map.kakao.com/link/map/${lat},${lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-2.5 text-center text-[11px] font-bold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors bg-white dark:bg-slate-800"
                        >
                            카카오맵으로 크게 보기
                        </a>
                    </div>
                ) : type === 'image' && imageUrl ? (
                    <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-slate-100 max-w-[240px]">
                        <img src={imageUrl} alt="전송된 이미지" className="w-full h-auto object-cover" />
                    </div>
                ) : (
                    <div
                        className={`
                            overflow-hidden shadow-sm leading-relaxed text-[15px]
                            ${isBot
                                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 p-3.5'
                                : 'bg-primary text-white rounded-2xl rounded-tr-none shadow-md p-3'
                            }
                        `}
                    >
                        {type !== 'image' && type !== 'location' && (
                            <div dangerouslySetInnerHTML={{ __html: text }} />
                        )}
                    </div>
                )}

                {/* Timestamp */}
                {timestamp && (
                    <span className="text-[10px] text-slate-400">{timestamp}</span>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
