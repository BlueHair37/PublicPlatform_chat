import React, { useRef } from 'react';

const InputArea = ({ onSendMessage }) => {
    const [inputValue, setInputValue] = React.useState('');
    const fileInputRef = useRef(null);

    const handleSend = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.isComposing || e.nativeEvent.isComposing) {
            return;
        }
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleLocationClick = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                onSendMessage(`현재 위치 전송: ${latitude}, ${longitude}`);
            },
            (error) => {
                console.error("Error getting location:", error);
                alert("위치 정보를 가져올 수 없습니다.");
            }
        );
    };

    const handlePhotoClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // For now, we'll simulate sending by passing a message. 
            // Ideally, we'd handle file upload separately or pass the file object.
            // We can assume the parent handles it if we pass a special format or object,
            // but to keep signature simple strictly for this prompt's scope:
            onSendMessage(`[사진 전송] ${file.name}`);

            // Note: To fully implement photo upload properly, we would need to:
            // 1. Upload to server first or convert to base64
            // 2. Send the URL/base64 to the chat API
        }
    };

    return (
        <footer className="bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 p-4 pb-8 sticky bottom-0 z-50">
            <div className="flex items-center gap-2">
                <button
                    className="flex items-center justify-center size-11 rounded-full bg-busan-light dark:bg-slate-700 text-primary hover:bg-primary/10 transition-colors"
                    onClick={handleLocationClick}
                    title="현재 위치 전송"
                >
                    <span className="material-symbols-outlined text-[24px]">location_on</span>
                </button>
                <button
                    className="flex items-center justify-center size-11 rounded-full bg-busan-light dark:bg-slate-700 text-primary hover:bg-primary/10 transition-colors"
                    onClick={handlePhotoClick}
                    title="사진 촬영/업로드"
                >
                    <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                </button>
                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="내용을 입력하세요..."
                        className="w-full h-11 pl-4 pr-12 rounded-full border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                    />
                    <button
                        onClick={handleSend}
                        className="absolute right-1 top-1 bottom-1 px-3 flex items-center justify-center text-primary"
                    >
                        <span className="material-symbols-outlined font-bold">send</span>
                    </button>
                </div>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-4 font-medium">
                부산광역시 공식 AI 민원 서비스
            </p>
        </footer>
    );
};

export default InputArea;
