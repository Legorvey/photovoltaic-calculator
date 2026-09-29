import React from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

interface HeaderProps {
  handlePrint: () => void;
}

export default function Header({ handlePrint }: HeaderProps) {
  return (
    <header className="w-full py-2 flex flex-col md:flex-row justify-between items-start md:items-center print:shadow-none print:border-b print:rounded-none print:p-0 print:pb-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded bg-[#1B4D3E] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Solar PV Report
          </h1>
        </div>
        <p className="mt-0.5 text-slate-500 text-sm">
          20-Year Financial Projection
        </p>
      </div>
      
      <div className="mt-2 md:mt-0 flex gap-4 print:hidden">
        <Button onClick={handlePrint} variant="default" className="flex items-center gap-2 h-8 text-sm">
          <Download className="w-4 h-4" />
          Export Report (PDF)
        </Button>
      </div>
    </header>
  );
}
