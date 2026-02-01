import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, FeatureGroup } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet.heat';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Fix for default marker icon missing in React-Leaflet/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

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

const HeatmapLayer = ({ points }) => {
    const map = useMap();

    useEffect(() => {
        if (!points || points.length === 0) return;

        // Points format: [[lat, lng, intensity], ...]
        const heat = L.heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: {
                0.4: 'blue',
                0.6: 'cyan',
                0.7: 'lime',
                0.8: 'yellow',
                1.0: 'red'
            }
        });

        heat.addTo(map);

        return () => {
            map.removeLayer(heat);
        };
    }, [points, map]);

    return null;
};

const ReportModal = ({ visible, onClose, data }) => {
    if (!visible || !data) return null;

    // Prepare Radar Data (Mocking missing fields for now if not provided)
    const radarData = [
        { subject: '긴급도', A: data.urgency_score || 50, fullMark: 100 },
        { subject: '안전위협', A: (data.urgency_score || 50) * 0.9, fullMark: 100 }, // Correlated
        { subject: '시민불편', A: (data.urgency_score || 50) * 0.8, fullMark: 100 },
        { subject: '파급효과', A: (data.urgency_score || 50) * 0.7, fullMark: 100 },
        { subject: '민원빈도', A: Math.min((data.chart_data?.counts?.reduce((a, b) => a + b, 0) || 0) * 10, 100), fullMark: 100 },
    ];

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-3xl">analytics</span>
                            종합 분석 리포트
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">AI Urban Analytics • Context Driven Analysis</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                        <span className="material-symbols-outlined text-slate-500">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Left: Charts */}
                        <div className="space-y-6">
                            {/* Radar Chart */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-500">radar</span>
                                    다차원 평가지표
                                </h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                            <PolarGrid stroke="#e2e8f0" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar name="Assessment" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
                                            <Tooltip />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Bar Chart */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-pink-500">bar_chart</span>
                                    주요 민원 유형
                                </h3>
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.chart_data?.categories?.map((cat, i) => ({ name: cat, value: data.chart_data.counts[i] })) || []}>
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                                            <YAxis />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                {data.chart_data?.categories?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6'][index % 4]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Right: Text Report */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 prose dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {data.report}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3">
                    <button className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                        PDF 내보내기
                    </button>
                    <button onClick={onClose} className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:brightness-110 transition shadow-lg shadow-blue-500/20">
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

const MapArea = () => {
    const [zoomTrigger, setZoomTrigger] = useState({ in: 0, out: 0, reset: 0 });
    const [currentAddress, setCurrentAddress] = useState("부산광역시 연제구 (중심)");
    const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
    const [wordCloudItems, setWordCloudItems] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);
    const featureGroupRef = useRef();

    const [regionAnalysis, setRegionAnalysis] = useState({
        visible: false,
        loading: false,
        data: null,
        error: null
    });

    const [showFullReport, setShowFullReport] = useState(false); // Modal State

    const [selectedComplaintId, setSelectedComplaintId] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [isLoadingReport, setIsLoadingReport] = useState(false);

    const customIcon = useMemo(() => {
        return L.icon({
            iconUrl: icon,
            shadowUrl: iconShadow,
            iconSize: [25, 41],
            iconAnchor: [12, 41]
        });
    }, []);

    const fetchMapData = () => {
        // Fetch Word Cloud Items
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

        // Fetch Heatmap Data
        fetch('http://localhost:8000/api/map/heatmap')
            .then(res => res.json())
            .then(data => {
                setHeatmapData(data);
            })
            .catch(err => console.error("Failed to fetch heatmap items:", err));
    };

    useEffect(() => {
        fetchMapData();
        const interval = setInterval(fetchMapData, 5000); // 5 sec poll
        return () => clearInterval(interval);
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

    const handleCreated = async (e) => {
        const type = e.layerType;
        const layer = e.layer;

        if (type === 'polygon' || type === 'rectangle') {
            const latlngs = layer.getLatLngs()[0];
            const polygonCoords = latlngs.map(ll => [ll.lat, ll.lng]);

            console.log("Analyzing Polygon:", polygonCoords);

            setRegionAnalysis({ visible: true, loading: true, data: null, error: null });

            try {
                const res = await fetch('http://localhost:8000/api/map/analyze-region', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ polygon: polygonCoords })
                });

                if (!res.ok) throw new Error('Analysis Failed');

                const data = await res.json();
                setRegionAnalysis({ visible: true, loading: false, data: data, error: null });

            } catch (err) {
                console.error("Region Analysis Error:", err);
                setRegionAnalysis({ visible: true, loading: false, data: null, error: err.message });
            }
        }
    };

    useEffect(() => {
        if (selectedComplaintId) {
            setIsLoadingReport(true);
            setReportData(null); // Reset

            fetch(`http://localhost:8000/api/complaint/${selectedComplaintId}/analyze`)
                .then(res => res.json())
                .then(data => {
                    setReportData(data);
                    setIsLoadingReport(false);
                })
                .catch(err => {
                    console.error("Report fetch error:", err);
                    setIsLoadingReport(false);
                });
        }
    }, [selectedComplaintId]);

    return (
        <main className="relative flex-1 bg-slate-200 dark:bg-slate-950 overflow-hidden z-0">
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

                <HeatmapLayer points={heatmapData} />

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

                {wordCloudItems.map((item, index) => {
                    const textIcon = L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div style="font-size: ${item.size}; ${item.style ? Object.entries(item.style).map(([k, v]) => `${k}:${v}`).join(';') : ''}" 
                               class="${item.className} cursor-pointer word-cloud-item hover:scale-110 transition-transform duration-200">
                               ${item.text}
                          </div>`,
                        iconSize: [100, 40],
                        iconAnchor: [50, 20]
                    });

                    return (
                        <Marker
                            key={index}
                            position={item.position}
                            icon={textIcon}
                            opacity={1}
                            eventHandlers={{
                                click: () => {
                                    if (item.id) {
                                        // setSelectedComplaintId(item.id); 
                                    }
                                }
                            }}
                        />
                    );
                })}
            </MapContainer>

            {/* Top Left Instructions */}
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

            {/* Zoom Controls */}
            <div className="absolute bottom-10 right-6 flex flex-col gap-2 z-[400] pointer-events-none">
                <div className="flex flex-col rounded-lg bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden pointer-events-auto">
                    <button onClick={() => setZoomTrigger(prev => ({ ...prev, in: prev.in + 1 }))} className="p-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><span className="material-symbols-outlined">add</span></button>
                    <button onClick={() => setZoomTrigger(prev => ({ ...prev, out: prev.out + 1 }))} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><span className="material-symbols-outlined">remove</span></button>
                </div>
                <button onClick={() => setZoomTrigger(prev => ({ ...prev, reset: prev.reset + 1 }))} className="p-3 rounded-lg bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 hover:text-primary transition-colors pointer-events-auto">
                    <span className="material-symbols-outlined">my_location</span>
                </button>
            </div>

            {/* Region Analysis Panel */}
            {regionAnalysis.visible && (
                <div className="absolute top-[10%] right-[3%] p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[500] w-96 max-h-[85vh] overflow-y-auto pointer-events-auto animate-in slide-in-from-right-5 duration-300">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                            <span className="material-symbols-outlined text-primary">hub</span>
                            지역 맥락 분석
                        </h3>
                        <button onClick={() => setRegionAnalysis({ ...regionAnalysis, visible: false })} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {regionAnalysis.loading ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-medium text-slate-500 animate-pulse">
                                AI가 지역 데이터를 수집하고<br />맥락을 연결하고 있습니다...
                            </p>
                        </div>
                    ) : regionAnalysis.data ? (
                        <div className="space-y-5">

                            {/* Urgency Score & Sentiment */}
                            {(regionAnalysis.data.urgency_score !== undefined) && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30 flex flex-col items-center justify-center">
                                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">긴급도 (Urgency)</span>
                                        <div className="text-3xl font-black text-red-600 dark:text-red-400 mt-1">
                                            {regionAnalysis.data.urgency_score}
                                            <span className="text-sm font-medium text-red-400 ml-0.5">/100</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col justify-center gap-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-slate-500">부정 (Neg)</span>
                                            <span className="font-mono text-red-500">{regionAnalysis.data.sentiment_breakdown?.Negative || 0}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                            <div className="h-full bg-red-500" style={{ width: `${regionAnalysis.data.sentiment_breakdown?.Negative || 0}%` }}></div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-slate-500">중립 (Neu)</span>
                                            <span className="font-mono text-slate-500">{regionAnalysis.data.sentiment_breakdown?.Neutral || 0}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                            <div className="h-full bg-slate-500" style={{ width: `${regionAnalysis.data.sentiment_breakdown?.Neutral || 0}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bar Chart Section */}
                            {regionAnalysis.data?.chart_data?.counts?.length > 0 && (
                                <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-3">
                                        <span className="material-symbols-outlined text-[14px]">bar_chart</span>
                                        주요 이슈 빈도
                                    </span>
                                    <div className="h-40 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={regionAnalysis.data.chart_data.categories.map((cat, i) => ({ name: cat, value: regionAnalysis.data.chart_data.counts[i] }))}>
                                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={0} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                                                    cursor={{ fill: 'transparent' }}
                                                />
                                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                    {regionAnalysis.data.chart_data.categories.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6'][index % 4]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* Semantic Context */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-inner">
                                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-2">
                                    <span className="material-symbols-outlined text-[14px]">psychology</span>
                                    상황 맥락 (Context)
                                </span>
                                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                                    {regionAnalysis.data.context}
                                </p>
                            </div>

                            {/* Themes */}
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-2">
                                    <span className="material-symbols-outlined text-[14px]">category</span>
                                    주요 이슈 패턴
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(regionAnalysis.data.themes || {}).map(([theme, items], idx) => (
                                        <div key={idx} className="group relative">
                                            <span className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm cursor-help hover:border-primary/50 transition-colors">
                                                #{theme}
                                            </span>
                                            {/* Tooltip for theme items */}
                                            <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-900 text-white text-xs rounded-lg p-2 invisible group-hover:visible z-50 opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                                                <ul className="list-disc pl-3 space-y-1">
                                                    {items.slice(0, 3).map((it, i) => <li key={i}>{it}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Full Report View */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={() => setShowFullReport(true)}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                                >
                                    <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">article</span>
                                    종합 분석 리포트 보기
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            {regionAnalysis.error || "분석할 데이터가 없습니다."}
                        </div>
                    )}
                </div>
            )}

            {/* Report Modal */}
            <ReportModal
                visible={showFullReport}
                onClose={() => setShowFullReport(false)}
                data={regionAnalysis.data}
            />
        </main>
    );
};

export default MapArea;
