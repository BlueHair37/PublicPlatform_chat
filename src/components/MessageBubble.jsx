import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet markers in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Component to recenter map when coords change
function ChangeView({ center }) {
    const map = useMap();
    map.setView(center);
    return null;
}

const MessageBubble = ({ sender, text, timestamp, isFirstInGroup, type, imageFile, lat, lng }) => {
    const isBot = sender === 'bot';
    const [previewUrl, setPreviewUrl] = useState(null);

    const customIcon = useMemo(() => {
        return L.icon({
            iconUrl: icon,
            shadowUrl: iconShadow,
            iconSize: [25, 41],
            iconAnchor: [12, 41]
        });
    }, []);

    useEffect(() => {
        if (imageFile) {
            const url = URL.createObjectURL(imageFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [imageFile]);

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
                    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 w-[240px] h-[200px] relative z-0">
                        <MapContainer
                            center={[lat, lng]}
                            zoom={16}
                            scrollWheelZoom={false}
                            zoomControl={false}
                            className="w-full h-full"
                        >
                            <ChangeView center={[lat, lng]} />
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={[lat, lng]} icon={customIcon} />
                        </MapContainer>
                    </div>
                ) : type === 'image' && previewUrl ? (
                    <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-slate-100 max-w-[240px] min-h-[100px] bg-slate-100 flex items-center justify-center">
                        {/* Min height ensures it doesn't look broken while loading */}
                        <img
                            src={previewUrl}
                            alt="전송된 이미지"
                            className="w-full h-auto object-cover block"
                        />
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
