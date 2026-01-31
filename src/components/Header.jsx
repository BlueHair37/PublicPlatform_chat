import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="flex items-center justify-between px-4 py-4 border-b border-slate-100 bg-white dark:bg-slate-800 sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <button className="text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined">arrow_back_ios</span>
                </button>
                <h2 className="text-lg font-bold tracking-tight text-primary">부산 민원 AI 챗봇</h2>
            </div>
            <div className="flex items-center gap-2">
                <Link to="/dashboard" className="p-2 text-xs font-bold bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                    대시보드
                </Link>
                <button className="size-8 flex items-center justify-center text-slate-500">
                    <span className="material-symbols-outlined">notifications</span>
                </button>
                <button className="size-8 flex items-center justify-center text-slate-500">
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
