import React, { useState } from 'react';

const Sidebar = () => {
    const [filters, setFilters] = useState({
        noise: true,
        damage: true,
        env: false,
        parking: false
    });

    return (
        <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col gap-8 overflow-y-auto shrink-0">
            <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4 px-1">민원 유형 필터</p>
                <div className="space-y-2">
                    {[
                        { id: 'noise', label: '소음 민원 (Noise)', checked: filters.noise },
                        { id: 'damage', label: '파손/복구 (Damage)', checked: filters.damage },
                        { id: 'env', label: '환경/위생 (Env)', checked: filters.env },
                        { id: 'parking', label: '불법 주정차', checked: filters.parking },
                    ].map((item) => (
                        <label key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => setFilters(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                className="rounded text-primary focus:ring-primary border-slate-300"
                            />
                            <span className="text-sm font-medium">{item.label}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4 px-1">긴급도 설정</p>
                <div className="grid grid-cols-3 gap-2">
                    <button className="py-2 text-[11px] font-bold rounded-lg border border-red-200 bg-red-50 text-red-600 dark:bg-red-900/20 dark:border-red-800">높음</button>
                    <button className="py-2 text-[11px] font-bold rounded-lg border border-orange-200 bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:border-orange-800">중간</button>
                    <button className="py-2 text-[11px] font-bold rounded-lg border border-slate-200 bg-white text-slate-600 dark:bg-slate-800 dark:border-slate-700">낮음</button>
                </div>
            </div>
            <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4 px-1">분석 기간</p>
                <div className="space-y-3">
                    <div className="relative">
                        <input className="w-full h-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-xs p-2" type="date" defaultValue="2023-10-20" />
                        <span className="absolute right-3 top-2 text-[10px] text-slate-400 pointer-events-none">시작</span>
                    </div>
                    <div className="relative">
                        <input className="w-full h-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-xs p-2" type="date" defaultValue="2023-10-27" />
                        <span className="absolute right-3 top-2 text-[10px] text-slate-400 pointer-events-none">종료</span>
                    </div>
                </div>
            </div>
            <div className="mt-auto space-y-3 pt-4">
                <button
                    onClick={() => alert('AI 분석 보고서 생성을 시작합니다...')}
                    className="w-full h-11 bg-primary text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    AI 리포트 생성 (PDF)
                </button>
                <p className="text-[10px] text-center text-slate-400 leading-tight">선택된 영역 및 필터 기반으로<br />상세 분석 보고서를 생성합니다.</p>
            </div>
        </aside>
    );
};

export default Sidebar;
