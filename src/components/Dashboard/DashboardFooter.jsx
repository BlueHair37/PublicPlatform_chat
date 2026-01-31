import React from 'react';

const DashboardFooter = () => {
    // Duplicate data for infinite scroll effect
    const complaints = [
        { id: 1, loc: '해운대구', text: '좌동순환로 가로등 2기 소등 신고', time: '14:22' },
        { id: 2, loc: '강서구', text: '명지국제신도시 건축 공사 소음 발생', time: '14:20' },
        { id: 3, loc: '사하구', text: '하단역 인근 불법 주정차 차량 신고', time: '14:18' },
        { id: 4, loc: '기장군', text: '일광해수욕장 산책로 쓰레기 방치', time: '14:15' },
        { id: 5, loc: '연제구', text: '연산교차로 노면 표시 마모 보수 요청', time: '14:12' },
        { id: 6, loc: '중구', text: '남포동 먹자골목 위생 불량 신고', time: '14:10' }, // Added
        { id: 7, loc: '동래구', text: '온천천 산책로 자전거 도로 파손', time: '14:05' },   // Added
        // Duplicates for seamless loop
        { id: 8, loc: '해운대구', text: '좌동순환로 가로등 2기 소등 신고', time: '14:22' },
        { id: 9, loc: '강서구', text: '명지국제신도시 건축 공사 소음 발생', time: '14:20' },
        { id: 10, loc: '사하구', text: '하단역 인근 불법 주정차 차량 신고', time: '14:18' },
    ];

    return (
        <footer className="h-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center px-4 shrink-0 overflow-hidden relative z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-1 rounded text-[10px] font-bold mr-4 z-10 shrink-0">
                <span className="relative flex h-2 w-2 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                실시간 민원 피드
            </div>

            {/* Vertical Marquee Container */}
            <div className="flex-1 h-8 overflow-hidden relative">
                <div className="vertical-marquee-content absolute w-full left-0 top-0">
                    {complaints.map((item, index) => (
                        <div key={index} className="h-8 flex items-center text-xs font-medium text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-2 w-full truncate">
                                <b className="text-slate-900 dark:text-slate-100">[{item.loc}]</b>
                                <span className="truncate">{item.text}</span>
                                <span className="text-slate-400 text-[10px] ml-auto">({item.time})</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4 ml-4 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur pl-4">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-red"></span>
                    <span className="text-[10px] text-slate-500 font-bold">긴급 12</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-orange"></span>
                    <span className="text-[10px] text-slate-500 font-bold">보통 45</span>
                </div>
            </div>
        </footer>
    );
};

export default DashboardFooter;
