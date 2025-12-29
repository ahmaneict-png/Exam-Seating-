import React from 'react';
import type { GeneratedReport } from '../types';
import { exportToPdf, exportToWord, exportNoticeBoardToPdf } from '../services/exportService';
import { FileTextIcon } from './icons/FileTextIcon';
import { WordIcon } from './icons/WordIcon';
import { SheetIcon } from './icons/SheetIcon';

interface DownloadViewProps {
  report: GeneratedReport;
}

const DownloadView: React.FC<DownloadViewProps> = ({ report }) => {
  
  const handlePdfDownload = () => {
    exportToPdf(report);
  };

  const handleWordDownload = () => {
    exportToWord(report);
  };

  const handleNoticeBoardDownload = () => {
    exportNoticeBoardToPdf(report);
  }

  return (
    <div className="space-y-4">
      <p className="text-slate-600">Export the complete seating arrangement and summary reports.</p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={handlePdfDownload}
          className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
        >
          <FileTextIcon />
          Download Detailed PDF
        </button>
        <button 
          onClick={handleWordDownload}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <WordIcon />
          Download Word
        </button>
      </div>
      <div className="pt-4 mt-4 border-t border-slate-200">
        <p className="text-slate-600">Export a simplified summary for the notice board.</p>
        <button
          onClick={handleNoticeBoardDownload}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          <SheetIcon />
          Download Notice Board Summary (PDF)
        </button>
      </div>
    </div>
  );
};

export default DownloadView;