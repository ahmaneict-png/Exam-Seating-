
import React, { useState } from 'react';
import type { GeneratedReport } from '../types';
import ArrangementView from './ArrangementView';
import SummaryView from './SummaryView';
import DownloadView from './DownloadView';
import { ListIcon } from './icons/ListIcon';
import { BarChartIcon } from './icons/BarChartIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface ResultsDisplayProps {
  report: GeneratedReport;
}

type Tab = 'arrangement' | 'summary' | 'download';

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ report }) => {
  const [activeTab, setActiveTab] = useState<Tab>('arrangement');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'arrangement', label: 'Room-wise List', icon: <ListIcon /> },
    { id: 'summary', label: 'Summary', icon: <BarChartIcon /> },
    { id: 'download', label: 'Download', icon: <DownloadIcon /> },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-slate-700">3. Generated Arrangement</h2>
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">
        {activeTab === 'arrangement' && <ArrangementView report={report} />}
        {activeTab === 'summary' && <SummaryView data={report.summary} />}
        {activeTab === 'download' && <DownloadView report={report} />}
      </div>
    </div>
  );
};

export default ResultsDisplay;
