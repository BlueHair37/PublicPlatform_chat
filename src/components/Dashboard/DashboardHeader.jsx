import React from 'react';
import { Link } from 'react-router-dom';

const DashboardHeader = () => {
    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 shrink-0 z-50">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                        <span className="material-symbols-outlined">analytics</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold leading-tight tracking-tight">부산 민원 통합 분석 V2</h2>
                        <p className="text-xs text-slate-500 font-medium">AI 기반 도시 관리 시스템</p>
                    </div>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                <nav className="hidden md:flex items-center gap-6">
                    <a href="#" className="text-primary text-sm font-semibold">대시보드</a>
                    <Link to="/" className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary">AI 상담원</Link>
                    <a href="#" className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary">지도 분석</a>
                    <a href="#" className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary">통계 데이터</a>
                    <a href="#" className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary">AI 리포트</a>
                </nav>
            </div>
            <div className="flex flex-1 max-w-md mx-8">
                <label className="relative w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                    </span>
                    <input
                        type="text"
                        className="w-full h-10 bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                        placeholder="행정구역 또는 민원 키워드 검색..."
                    />
                </label>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-700 rounded shadow-sm text-slate-900 dark:text-slate-100">워드 클라우드</button>
                    <button className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">히트맵</button>
                </div>
                <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined">notifications</span>
                </button>
                <div className="h-8 w-8 rounded-full bg-cover bg-center border border-slate-200" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCw4FUGv7pfDmdmtX1G6OGQaHScCD73FA_2QD6CSkY4o0_pnqDQPI3qkbsRpqVy35ntIDbmFCpgmWCyy08HLIIjYb_g0DzZTvcmkUtX_2SaiNsRkqQ6WPXn6gMmZVYbfsdG6ZiWG0hasW1Y76D9c7nZNvFZ7UcPmuB35p2mnWNodXFcIEp-lZCAagc3wg38fq9IaEvoMf2mZsMPbKkkBHqg7__b1Cmpk_gKtW-8AHGmL6f-gimHyL4-to6hep9HZ_82tEa1dPoxlrbY")' }}></div>
            </div>
        </header>
    );
};

export default DashboardHeader;
