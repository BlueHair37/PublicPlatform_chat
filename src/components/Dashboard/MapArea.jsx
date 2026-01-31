import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polygon, FeatureGroup } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix for default marker icon missing in React-Leaflet/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Busan coordinates
const DEFAULT_CENTER = [35.1795543, 129.0756416];
const INITIAL_ZOOM = 13;

const MapEvents = ({ onMoveEnd, onZoomEnd }) => {
    const map = useMapEvents({
        moveend: () => {
            onMoveEnd(map.getCenter());
        },
        zoomend: () => {
            onZoomEnd(map.getZoom());
        }
    });
    return null;
};

const ZoomController = ({ zoomInTrigger, zoomOutTrigger, flyToLocation }) => {
    const map = useMap();

    useEffect(() => {
        if (zoomInTrigger) map.zoomIn();
    }, [zoomInTrigger]);

    useEffect(() => {
        if (zoomOutTrigger) map.zoomOut();
    }, [zoomOutTrigger]);

    useEffect(() => {
        if (flyToLocation) {
            map.flyTo(DEFAULT_CENTER, INITIAL_ZOOM);
        }
    }, [flyToLocation]);

    return null;
};

const MapArea = () => {
    const [selectionVisible, setSelectionVisible] = useState(false);
    const [zoomTrigger, setZoomTrigger] = useState({ in: 0, out: 0, reset: 0 });
    const [currentAddress, setCurrentAddress] = useState("부산광역시 연제구 (중심)");
    const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
    const [wordCloudItems, setWordCloudItems] = useState([]);
    const featureGroupRef = useRef();

    useEffect(() => {
        fetch('http://localhost:8000/api/map/items')
            .then(res => res.json())
            .then(data => {
                const formattedItems = data.map(item => ({
                    text: item.text,
                    position: [item.lat, item.lng],
                    size: item.size,
                    className: item.class_name,
                    style: item.style || {}
                }));
                setWordCloudItems(formattedItems);
            })
            .catch(err => console.error("Failed to fetch map items:", err));
    }, []);

    const fetchAddress = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`, {
                headers: { 'User-Agent': 'BusanCivilComplaintDashboard/1.0' }
            });
            const data = await response.json();
            if (data && data.address) {
                const addr = data.address;
                const district = addr.city_district || addr.district || addr.borough || '';
                const neighborhood = addr.neighbourhood || addr.quarter || addr.suburb || '';
                const city = addr.city || addr.province || '부산광역시';
                setCurrentAddress(`${city} ${district} ${neighborhood}`.trim());
            }
        } catch (error) {
            console.error("Geocoding error:", error);
        }
    };

    const handleMapMoveEnd = (center) => {
        setMapCenter([center.lat, center.lng]);
        fetchAddress(center.lat, center.lng);
    };

    const handleCreated = (e) => {
        const type = e.layerType;
        const layer = e.layer;
        if (type === 'polygon' || type === 'rectangle') {
            setSelectionVisible(true);
            console.log("Shape created:", layer);
        }
    };

    return (
        <main className="relative flex-1 bg-slate-200 dark:bg-slate-950 overflow-hidden lasso-active z-0">

            <MapContainer
                center={DEFAULT_CENTER}
                zoom={INITIAL_ZOOM}
                scrollWheelZoom={true}
                className="w-full h-full z-0"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                <MapEvents onMoveEnd={handleMapMoveEnd} onZoomEnd={() => { }} />
                <ZoomController
                    zoomInTrigger={zoomTrigger.in}
                    zoomOutTrigger={zoomTrigger.out}
                    flyToLocation={zoomTrigger.reset}
                />

                <FeatureGroup ref={featureGroupRef}>
                    <EditControl
                        position="topleft"
                        onCreated={handleCreated}
                        draw={{
                            rectangle: true,
                            polygon: true,
                            circle: false,
                            marker: false,
                            polyline: false,
                            circlemarker: false
                        }}
                    />
                </FeatureGroup>

                {wordCloudItems.map((item, index) => (
                    <Marker
                        key={index}
                        position={item.position}
                        opacity={0}
                        eventHandlers={{
                            add: (e) => {
                                const marker = e.target;
                                marker.bindTooltip(item.text, {
                                    permanent: true,
                                    direction: 'center',
                                    className: `bg-transparent border-0 shadow-none ${item.text.includes('파손') ? 'text-3xl font-black text-primary' : 'text-lg font-bold text-slate-600'} word-cloud-label`
                                }).openTooltip();
                            }
                        }}
                    />
                ))}
            </MapContainer>

            <div className="absolute top-6 left-12 flex items-center gap-3 z-[400] pointer-events-none ml-8">
                <div className="flex bg-white dark:bg-slate-800 p-1 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 pointer-events-auto">
                    <span className="text-[10px] items-center flex px-2 text-slate-500 font-medium">← 지도에 영역을 그려보세요 (Draw)</span>
                </div>

                <div className="flex gap-2 pointer-events-auto">
                    <span className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 text-[11px] font-bold shadow-sm border border-slate-200 dark:border-slate-700 transition-all">
                        현재 위치: {currentAddress}
                    </span>
                </div>
            </div>

            <div className="absolute bottom-10 right-6 flex flex-col gap-2 z-[400] pointer-events-none">
                <div className="flex flex-col rounded-lg bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden pointer-events-auto">
                    <button onClick={() => setZoomTrigger(prev => ({ ...prev, in: prev.in + 1 }))} className="p-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><span className="material-symbols-outlined">add</span></button>
                    <button onClick={() => setZoomTrigger(prev => ({ ...prev, out: prev.out + 1 }))} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><span className="material-symbols-outlined">remove</span></button>
                </div>
                <button onClick={() => setZoomTrigger(prev => ({ ...prev, reset: prev.reset + 1 }))} className="p-3 rounded-lg bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 hover:text-primary transition-colors pointer-events-auto">
                    <span className="material-symbols-outlined">my_location</span>
                </button>
            </div>

            {selectionVisible && (
                <div className="absolute top-[40%] left-[50%] p-5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary/30 z-[500] w-64 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> 선택된 영역 분석</span>
                        <button onClick={() => setSelectionVisible(false)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined text-[16px]">close</span></button>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-[11px] mb-1">
                                <span className="text-slate-500 font-medium">도로 파손 심각도</span>
                                <span className="text-primary font-bold">88%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full w-[88%]"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                            <span className="text-slate-500">포함된 민원</span>
                            <span className="font-bold">124건</span>
                        </div>
                        <button onClick={() => alert('상세 리포트 생성을 시작합니다.')} className="w-full py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[11px] font-bold rounded-lg hover:opacity-90 transition-opacity">
                            AI 심층 분석 리포트 생성
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default MapArea;
