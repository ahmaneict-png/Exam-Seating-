
import React from 'react';
import type { ClassBatch } from '../types';
import BatchInputRow from './BatchInputRow';
import { PlusIcon } from './icons/PlusIcon';

interface InputFormProps {
  batches: ClassBatch[];
  setBatches: React.Dispatch<React.SetStateAction<ClassBatch[]>>;
  benchesPerRoom: number;
  setBenchesPerRoom: (val: number) => void;
  examName: string;
  setExamName: (val: string) => void;
  academicYear: string;
  setAcademicYear: (val: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ 
  batches, 
  setBatches, 
  benchesPerRoom, 
  setBenchesPerRoom, 
  examName,
  setExamName,
  academicYear,
  setAcademicYear,
  onGenerate, 
  isLoading 
}) => {
  
  const addBatch = () => {
    setBatches([
      ...batches,
      { id: Date.now().toString(), className: '', rollRange: '', absentees: '', isActive: true },
    ]);
  };

  const updateBatch = (id: string, updatedBatch: ClassBatch) => {
    setBatches(batches.map((batch) => (batch.id === id ? updatedBatch : batch)));
  };

  const removeBatch = (id: string) => {
    setBatches(batches.filter((batch) => batch.id !== id));
  };

  const capacityOptions = [
    { benches: 25, students: 50 },
    { benches: 30, students: 60 },
    { benches: 31, students: 62 },
  ];

  const examOptions = [
    'प्रथम चाचणी परीक्षा',
    'प्रथम सत्र परीक्षा',
    'द्वितीय चाचणी परीक्षा',
    'द्वितीय सत्र/वार्षिक परीक्षा'
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-slate-700">1. Exam Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-500 mb-1 uppercase">परीक्षेचे नाव</label>
            <select
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            >
              {examOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-500 mb-1 uppercase">शैक्षणिक वर्ष</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="उदा. 2024-25"
              className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-mono"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-slate-700">2. Room Capacity</h2>
        <div className="flex flex-wrap gap-4">
          {capacityOptions.map((opt) => (
            <button
              key={opt.benches}
              onClick={() => setBenchesPerRoom(opt.benches)}
              className={`flex-1 min-w-[120px] p-4 rounded-xl border-2 transition-all text-center ${
                benchesPerRoom === opt.benches
                  ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
              }`}
            >
              <div className="text-sm font-semibold mb-1">{opt.benches} Benches</div>
              <div className="text-xs opacity-75">{opt.students} Students</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-slate-700">3. Class Batches</h2>
        <div className="space-y-4">
          {batches.map((batch, index) => (
            <BatchInputRow
              key={batch.id}
              batch={batch}
              onUpdate={updateBatch}
              onRemove={removeBatch}
              isFirst={index === 0}
            />
          ))}
        </div>
        <button
          onClick={addBatch}
          className="mt-4 w-full flex items-center justify-center gap-2 text-blue-600 font-semibold py-2 px-4 rounded-lg border-2 border-dashed border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <PlusIcon />
          Add Another Batch
        </button>
      </div>

      <div className="pt-4">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98] disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center text-lg"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Seating Arrangement'
          )}
        </button>
      </div>
    </div>
  );
};

export default InputForm;
