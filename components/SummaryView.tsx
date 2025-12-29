
import React from 'react';
import type { RoomSummary } from '../types';

interface SummaryViewProps {
  data: RoomSummary[];
}

const ALL_STANDARDS = ['10th', '9th', '8th', '7th', '6th', '5th'];

const SummaryView: React.FC<SummaryViewProps> = ({ data }) => {
  if (data.length === 0) {
    return <p className="text-slate-500">No summary generated.</p>;
  }

  // Calculate column totals
  const columnTotals = ALL_STANDARDS.reduce((acc, std) => {
    acc[std] = data.reduce((sum, room) => sum + (room.counts[std] || 0), 0);
    return acc;
  }, {} as Record<string, number>);

  const grandTotal = data.reduce((sum, room) => sum + room.total, 0);

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 border-r border-slate-200">Room No.</th>
              {ALL_STANDARDS.map(std => (
                <th key={std} className="px-4 py-3 border-r border-slate-200 text-center">{std}</th>
              ))}
              <th className="px-4 py-3 text-center">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((room) => (
              <tr key={room.roomNumber} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3 font-bold text-blue-600 border-r border-slate-200">
                  खोली क्र. {room.roomNumber}
                </td>
                {ALL_STANDARDS.map(std => (
                  <td key={std} className={`px-4 py-3 border-r border-slate-200 text-center ${room.counts[std] ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
                    {room.counts[std] || 0}
                  </td>
                ))}
                <td className="px-4 py-3 text-center font-bold text-slate-700 bg-slate-50/50">
                  {room.total}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100 font-black border-t-2 border-slate-300">
            <tr>
              <td className="px-4 py-3 border-r border-slate-200">एकूण विद्यार्थी</td>
              {ALL_STANDARDS.map(std => (
                <td key={std} className="px-4 py-3 border-r border-slate-200 text-center">
                  {columnTotals[std]}
                </td>
              ))}
              <td className="px-4 py-3 text-center text-blue-600">
                {grandTotal}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 flex items-start gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>टीप: वरील तक्ता प्रश्नपत्रिका वितरणासाठी वापरावा. हा तक्ता "Detailed PDF" मध्ये सुद्धा शेवटच्या पानावर उपलब्ध आहे.</p>
      </div>
    </div>
  );
};

export default SummaryView;
