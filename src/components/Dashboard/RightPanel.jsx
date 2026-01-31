import React from 'react';

const RightPanel = () => {
    const [stats, setStats] = React.useState({ work_completion_rate: "65" });
    const [insight, setInsight] = React.useState("데이터 분석 중...");
    const [patterns, setPatterns] = React.useState([]);
    const [highRiskItems, setHighRiskItems] = React.useState([]);

    React.useEffect(() => {
        // Fetch real insight
        fetch('http://localhost:8000/api/dashboard/insight')
            .then(res => res.json())
            .then(data => setInsight(data.summary))
            .catch(err => {
                console.error(err);
                setInsight("데이터 연결 실패 (데모 모드: AI가 실시간 데이터를 분석 중입니다...)");
            });

        // Fetch patterns
        fetch('http://localhost:8000/api/dashboard/patterns')
            .then(res => res.json())
            .then(data => setPatterns(data))
            .catch(err => console.error("Failed to fetch patterns:", err));

        // Fetch high risk items
        fetch('http://localhost:8000/api/dashboard/high-risk')
            .then(res => res.json())
            .then(data => setHighRiskItems(data))
            .catch(err => console.error("Failed to fetch high-risk items:", err));

        // Fetch general stats
        fetch('http://localhost:8000/api/dashboard/stats/general')
            .then(res => res.json())
            .then(data => setStats(prev => ({ ...prev, ...data })))
            .catch(err => console.error("Failed to fetch stats:", err));
    }, []);

    return (
        <aside className="w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-hidden shrink-0">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">psychology_alt</span>
                    AI 지역 정밀 진단
                </h3>
                <p className="text-sm text-slate-500 mt-1">선택 영역에 대한 AI 자동 심층 분석</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <section>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">trending_up</span> 원인 및 추세 분석
                    </h4>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">실시간 AI 브리핑</p>
                            <div
                                className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: insight }}
                            ></div>
                        </div>

                        {patterns.map((pattern, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">{pattern.title}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: pattern.description }}>
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">priority_high</span> 실시간 고위험 신고
                        </h4>
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse">LIVE {highRiskItems.length}건</span>
                    </div>
                    <div className="space-y-3">
                        {highRiskItems.map((item, idx) => (
                            <div key={idx} className={`flex gap-4 p-3 rounded-xl border ${item.category === 'warning' ? 'border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10' : 'border-slate-100 dark:border-slate-800'}`}>
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.category === 'warning' ? 'bg-red-100 dark:bg-red-900/40 text-red-600' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-600'}`}>
                                    <span className="material-symbols-outlined">{item.category}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold">{item.title}</p>
                                        <span className={`text-[10px] font-bold ${item.category === 'warning' ? 'text-red-500' : 'text-slate-400'}`}>{item.time_text}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-2">{item.description}</p>
                                    <button className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1">
                                        {item.category === 'warning' ? <>긴급 현장팀 배정 <span className="material-symbols-outlined text-[14px]">arrow_forward</span></> : '상세 정보'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-slate-500 font-medium">오늘의 AI 업무 추천</span>
                    <span className="text-[11px] text-primary font-bold">완료 {stats.work_completion_rate}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${stats.work_completion_rate}%` }}></div>
                </div>
            </div>
        </aside>
    );
};

export default RightPanel;
