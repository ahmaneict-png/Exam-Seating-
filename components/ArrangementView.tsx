
import React from 'react';
import type { RoomArrangement, GeneratedReport, BatchSummary } from '../types';

interface ArrangementViewProps {
  report: GeneratedReport;
}

const BatchList = ({ title, batches, total, max }: { title: string; batches: BatchSummary[]; total: number; max: number }) => (
  <div className="flex-1 p-3 border-2 border-slate-200 rounded-xl bg-white shadow-sm">
    <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-100">
      <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider">{title}</h4>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${total === max ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
        {total} / {max}
      </span>
    </div>
    <div className="space-y-1.5">
      {batches.length > 0 ? (
        batches.map((batch) => (
          <div key={batch.className} className="flex flex-col text-xs p-2 bg-slate-50 border border-slate-100 rounded">
            <div className="flex justify-between font-bold text-slate-800">
              <span>{batch.className}</span>
              <div className="flex items-center gap-2">
                {batch.absentees && (
                  <span className="text-red-500 text-[10px] font-medium bg-red-50 px-1 rounded border border-red-100">
                    गैरहजर: {batch.absentees}
                  </span>
                )}
                <span className="text-blue-600">{batch.count} विद्यार्थी</span>
              </div>
            </div>
            <div className="text-slate-500 mt-0.5">नंबर: {batch.displayRanges.join(', ')}</div>
          </div>
        ))
      ) : (
        <div className="text-center py-4 text-slate-400 text-xs italic">रिक्त</div>
      )}
    </div>
  </div>
);

const ArrangementView: React.FC<ArrangementViewProps> = ({ report }) => {
  const { arrangement, maxBenches } = report;

  if (arrangement.length === 0) {
    return <p className="text-slate-500">No arrangement generated.</p>;
  }

  return (
    <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      {arrangement.map((room) => (
        <div key={room.roomNumber} className="relative p-5 border-2 border-blue-100 rounded-2xl bg-blue-50/30">
          <div className="absolute -top-4 left-6 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
            खोली क्र. {room.roomNumber}
          </div>
          
          <div className="mt-2 mb-4 text-right">
            <span className="text-sm font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
              एकूण विद्यार्थी: <span className="text-blue-600">{room.total}</span>
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <BatchList 
              title="डावी बाजू (बेंच १ ते ३१)" 
              batches={room.leftSide} 
              total={room.leftTotal} 
              max={maxBenches} 
            />
            <BatchList 
              title="उजवी बाजू (बेंच १ ते ३१)" 
              batches={room.rightSide} 
              total={room.rightTotal} 
              max={maxBenches} 
            />
          </div>
          
          <div className="mt-4 p-2 bg-white/60 rounded-lg text-center text-[11px] text-slate-500 border border-dashed border-slate-300">
            टीप: वरील इयत्तांच्या जोड्यांनुसार १ ते {maxBenches} बेंचवर मार्किंग करावे.
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArrangementView;
