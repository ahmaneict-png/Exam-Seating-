
import React, { useState, useEffect } from 'react';
import type { ClassBatch, GeneratedReport } from './types';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import { generateSeating } from './services/seatingService';

const App: React.FC = () => {
  const [batches, setBatches] = useState<ClassBatch[]>(() => {
    try {
      const savedBatches = localStorage.getItem('examSeatingBatches');
      if (savedBatches) {
        const parsed = JSON.parse(savedBatches);
        if (Array.isArray(parsed) && parsed.length > 0) {
            // Ensure older saved data gets isActive: true if it doesn't have it
            return parsed.map(b => ({ ...b, isActive: b.isActive !== undefined ? b.isActive : true }));
        }
      }
    } catch (error) {
      console.error("Failed to parse batches from localStorage", error);
    }
    return [
      { id: '1', className: '5th A', rollRange: '5101-5128', absentees: '', isActive: true },
      { id: '2', className: '5th B', rollRange: '5201-5227', absentees: '5226, 5227', isActive: true },
      { id: '3', className: '6th A', rollRange: '6101-6129', absentees: '', isActive: true },
      { id: '4', className: '6th B', rollRange: '6201-6229', absentees: '6210, 6216', isActive: true },
      { id: '5', className: '7th A', rollRange: '7101-7123', absentees: '', isActive: true },
      { id: '6', className: '7th B', rollRange: '7201-7222', absentees: '7203, 7221, 7222', isActive: true },
      { id: '7', className: '8th A', rollRange: '8101-8141', absentees: '8126', isActive: true },
      { id: '8', className: '8th B', rollRange: '8201-8238', absentees: '', isActive: true },
      { id: '9', className: '9th A', rollRange: '9101-9139', absentees: '9103, 9113', isActive: true },
      { id: '10', className: '9th B', rollRange: '9201-9238', absentees: '9218, 9222', isActive: true },
      { id: '11', className: '10th A', rollRange: '10101-10129', absentees: '10103, 10107, 10116, 10127', isActive: true },
      { id: '12', className: '10th B', rollRange: '10201-10232', absentees: '', isActive: true },
      { id: '13', className: '10th C', rollRange: '10301-10330', absentees: '10316', isActive: true },
    ];
  });
  
  const [benchesPerRoom, setBenchesPerRoom] = useState<number>(31);
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('examSeatingBatches', JSON.stringify(batches));
    } catch (error) {
      console.error("Failed to save batches to localStorage", error);
    }
  }, [batches]);


  const handleGenerate = () => {
    setError(null);
    setIsLoading(true);
    setReport(null);
    
    // Check if at least one batch is active
    if (!batches.some(b => b.isActive)) {
      setError("Please enable (check) at least one class batch to generate arrangement.");
      setIsLoading(false);
      return;
    }

    try {
      setTimeout(() => {
        const generatedReport = generateSeating(batches, benchesPerRoom);
        setReport(generatedReport);
        setIsLoading(false);
      }, 500);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8">
      <Header />
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <InputForm
          batches={batches}
          setBatches={setBatches}
          benchesPerRoom={benchesPerRoom}
          setBenchesPerRoom={setBenchesPerRoom}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />
        <div className="lg:col-span-1">
          {isLoading && (
            <div className="flex justify-center items-center h-96 bg-white rounded-xl shadow-md">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>
          )}
          {error && (
             <div className="flex justify-center items-center h-96 bg-white rounded-xl shadow-md p-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-red-600">Generation Failed</h3>
                <p className="text-red-500 mt-2">{error}</p>
              </div>
            </div>
          )}
          {report && !isLoading && <ResultsDisplay report={report} />}
          {!report && !isLoading && !error && (
             <div className="flex justify-center items-center h-96 bg-white rounded-xl shadow-md p-4">
              <div className="text-center text-slate-500">
                <h3 className="text-2xl font-semibold">Ready to Generate</h3>
                <p className="mt-2">Enable class batches, choose capacity, and click "Generate" to see the results here.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
