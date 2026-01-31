import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Avoid global prototype pollution if possible, or just re-assign locally for this component context if needed, 
// but since main map uses it, it's likely already set globally. We'll ensure it here too just in case.
L.Marker.prototype.options.icon = DefaultIcon;

const MessageBubble = ({ sender, text, timestamp, isFirstInGroup, type, imageFile, lat, lng }) => {
    const isBot = sender === 'bot';

    // Create Object URL for image preview
    const imageUrl = React.useMemo(() => {
        if (imageFile) return URL.createObjectURL(imageFile);
        return null;
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
                <div
                    className={`
            overflow-hidden shadow-sm leading-relaxed text-[15px]
            ${isBot
                            ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 p-3.5'
                            : 'bg-primary text-white rounded-2xl rounded-tr-none shadow-md'
                        }
            ${(type === 'location' || type === 'image') ? 'p-1' : ''} 
          `}
                >
                    {type === 'location' && lat && lng ? (
                        <div className="w-[240px] h-[160px] rounded-xl overflow-hidden relative z-0">
                            <MapContainer
                                center={[lat, lng]}
                                zoom={15}
                                scrollWheelZoom={false}
                                zoomControl={false}
                                dragging={false}
                                className="w-full h-full"
                            >
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                                <Marker position={[lat, lng]} />
                            </MapContainer>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 px-2">
                                📍 {lat.toFixed(4)}, {lng.toFixed(4)}
                            </div>
                        </div>
                    ) : type === 'image' && imageUrl ? (
                        <div className="max-w-[240px] rounded-xl overflow-hidden">
                            <img src={imageUrl} alt="Uploaded" className="w-full h-auto" />
                        </div>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: text }} />
                    )}
                </div>

                {/* Timestamp */}
                {timestamp && (
                    <span className="text-[10px] text-slate-400">{timestamp}</span>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
