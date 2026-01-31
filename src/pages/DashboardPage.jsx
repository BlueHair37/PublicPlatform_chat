import React from 'react';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import Sidebar from '../components/Dashboard/Sidebar';
import MapArea from '../components/Dashboard/MapArea';
import RightPanel from '../components/Dashboard/RightPanel';
import DashboardFooter from '../components/Dashboard/DashboardFooter';

const DashboardPage = () => {
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            <DashboardHeader />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <MapArea />
                <RightPanel />
            </div>
            <DashboardFooter />
        </div>
    );
};

export default DashboardPage;
