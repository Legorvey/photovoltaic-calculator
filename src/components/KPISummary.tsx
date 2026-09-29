import React from 'react';
import { formatNumber, formatIDR, formatCompactIDR } from '../utils/formatters';
import { Card, CardContent } from './ui/card';

interface KPISummaryProps {
  totalCapex: number;
  energyYear1: number;
  savingsYear1: number;
  npv: number;
  lcoe: number;
  paybackPeriod: string;
}

export default function KPISummary({
  totalCapex, energyYear1, savingsYear1, npv, lcoe, paybackPeriod
}: KPISummaryProps) {
  const isNpvPositive = npv >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

      <Card className="shadow-sm border-slate-100 rounded-2xl bg-white">
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div>
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
              Initial Investment
            </p>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {formatCompactIDR(totalCapex)}
            </h3>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100">
            <p className="text-slate-500 text-[10px]">Total Capital Expenditure</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-100 rounded-2xl bg-white">
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div>
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
              Year 1 Energy Yield
            </p>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {formatNumber(energyYear1, 0)} <span className="text-sm font-medium text-slate-500">kWh</span>
            </h3>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100">
            <p className="text-slate-500 text-[10px]">Estimated annual production</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-100 rounded-2xl bg-white">
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div>
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
              Year 1 Savings
            </p>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {formatCompactIDR(savingsYear1)} <span className="text-sm font-medium text-slate-500">/yr</span>
            </h3>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100">
            <p className="text-slate-500 text-[10px]">Based on self-consumption</p>
          </div>
        </CardContent>
      </Card>

      <Card className={`shadow-sm rounded-2xl ${isNpvPositive ? 'border-slate-100 bg-slate-100' : 'border-[#c25953] bg-[#fcf3f2]'}`}>
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div>
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${isNpvPositive ? 'text-slate-500' : 'text-[#a04540]'}`}>
              Net Present Value (NPV)
            </p>
            <h3 className={`text-xl font-bold tracking-tight ${isNpvPositive ? 'text-[#1B4D3E]' : 'text-[#a04540]'}`}>
              {formatCompactIDR(npv)}
            </h3>
          </div>
          <div className={`mt-2 pt-2 border-t ${isNpvPositive ? 'border-slate-200' : 'border-transparent'}`}>
            <p className={`text-[10px] ${isNpvPositive ? 'text-slate-500' : 'text-[#a04540]'}`}>
              {isNpvPositive ? 'Financially Viable' : 'Negative Return'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-100 rounded-2xl bg-white">
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div>
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
              LCOE
            </p>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {formatIDR(lcoe)} <span className="text-sm font-medium text-slate-500">/kWh</span>
            </h3>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100">
            <p className="text-slate-500 text-[10px]">Levelized Cost of Energy</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-100 rounded-2xl bg-white">
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div>
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
              Payback Period
            </p>
            <h3 className="text-xl font-bold text-[#1B4D3E] tracking-tight">
              {paybackPeriod}
            </h3>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100">
            <p className="text-slate-500 text-[10px]">Break-even timeline</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
