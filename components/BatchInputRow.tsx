
import React from 'react';
import type { ClassBatch } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface BatchInputRowProps {
  batch: ClassBatch;
  onUpdate: (id: string, updatedBatch: ClassBatch) => void;
  onRemove: (id: string) => void;
  isFirst: boolean;
}

const BatchInputRow: React.FC<BatchInputRowProps> = ({ batch, onUpdate, onRemove, isFirst }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    onUpdate(batch.id, { ...batch, [e.target.name]: value });
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-12 gap-2 p-3 rounded-lg border transition-all duration-200 ${
      batch.isActive 
        ? 'bg-slate-50 border-slate-200 opacity-100' 
        : 'bg-slate-100 border-slate-300 opacity-60 grayscale-[0.5]'
    }`}>
      <div className="md:col-span-1 flex items-center justify-center">
        <div className="flex flex-col items-center">
          {isFirst && <label className="text-[10px] font-bold text-slate-500 mb-1 uppercase">Active</label>}
          <input
            type="checkbox"
            name="isActive"
            checked={batch.isActive !== false}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
            title={batch.isActive ? "Disable this batch" : "Enable this batch"}
          />
        </div>
      </div>
      <div className="md:col-span-2">
         {isFirst && <label className="text-xs font-bold text-slate-500">Class Name</label>}
        <input
          type="text"
          name="className"
          value={batch.className}
          onChange={handleChange}
          disabled={batch.isActive === false}
          placeholder="e.g., 10th A"
          className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
        />
      </div>
      <div className="md:col-span-4">
         {isFirst && <label className="text-xs font-bold text-slate-500">Roll No. Range (from-to)</label>}
        <input
          type="text"
          name="rollRange"
          value={batch.rollRange}
          onChange={handleChange}
          disabled={batch.isActive === false}
          placeholder="e.g., 10101-10120"
          className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
        />
      </div>
      <div className="md:col-span-4">
        {isFirst && <label className="text-xs font-bold text-slate-500">Absentees (comma-sep)</label>}
        <input
          type="text"
          name="absentees"
          value={batch.absentees}
          onChange={handleChange}
          disabled={batch.isActive === false}
          placeholder="e.g., 10105, 10110"
          className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
        />
      </div>
      <div className="md:col-span-1 flex items-end">
        <button
          onClick={() => onRemove(batch.id)}
          className="w-full h-10 flex items-center justify-center bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
          aria-label="Remove batch"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

export default BatchInputRow;
