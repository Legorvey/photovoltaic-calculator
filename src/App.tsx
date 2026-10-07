import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Header from './components/Header';
import SystemSpecsForm from './components/SystemSpecsForm';
import FinancialInputs from './components/FinancialInputs';
import KPISummary from './components/KPISummary';
import CashFlowChart from './components/CashFlowChart';
import { formatCompactIDR } from './utils/formatters';
import { useFinancialProjection } from './hooks/useFinancialProjection';
import { V_SYS } from './constants/engine';

export default function App() {
  // Print Ref
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Solar_PV_Feasibility_Report',
  });

  // State Management (Inputs)
  const [dailyLoad, setDailyLoad] = useState<number>(40.3); // kWh/day
  const [daysOfAutonomy, setDaysOfAutonomy] = useState<number>(3); // days
  const [subsidy, setSubsidy] = useState<number>(80); // % (0 - 100)
  const [bumdesTariff, setBumdesTariff] = useState<number>(2500); // IDR/kWh
  const [systemCapacity, setSystemCapacity] = useState<number>(10.4); // kWp
  const [capexPv, setCapexPv] = useState<number>(16000000); // IDR/kWp

  const {
    minPvRequired,
    isPvSufficient,
    batteryCapacityKwh,
    grossCapex,
    netCapex,
    projectionData,
    npv,
    lcoe,
    paybackPeriod,
    dieselLcoeIdr,
    lcoeSavingsPercentage
  } = useFinancialProjection({
    dailyLoad,
    daysOfAutonomy,
    subsidy,
    bumdesTariff,
    systemCapacity,
    capexPv
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 flex justify-center items-center font-sans text-slate-800">
      <div className="w-full max-w-[1500px] my-auto">
        <div ref={componentRef} className="flex flex-col print:flex-col print:p-8">
          
          <div className="flex flex-col xl:flex-row flex-1">
            {/* LEFT COLUMN (Wide) */}
            <div className="w-full xl:w-[72%] p-6 lg:p-10 flex flex-col gap-6">
              
              {/* Top Header */}
              <div className="flex justify-between items-center mb-2">
                <Header handlePrint={handlePrint} npv={npv} />
              </div>

              {/* Diesel vs Microgrid Banner */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center text-emerald-950 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#357a5e] mb-1">Cost Comparison</span>
                  <p className="text-sm">
                    <span className="font-medium text-slate-500 line-through mr-2">Diesel: Rp {dieselLcoeIdr?.toLocaleString('id-ID', { maximumFractionDigits: 0 })}/kWh</span>
                    <span className="font-bold">Microgrid: Rp {lcoe?.toLocaleString('id-ID', { maximumFractionDigits: 0 })}/kWh</span>
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-sm font-bold text-center">
                  {lcoeSavingsPercentage?.toFixed(1) || 0}% more cost-effective
                </div>
              </div>

              {/* Main Chart Area */}
              <div className="bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 flex-1 flex flex-col shadow-sm min-h-[500px] transition-all duration-300 hover:shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-slate-500 font-medium">Net Present Value</p>
                    <h2 className={`text-4xl lg:text-5xl font-bolder mt-1 ${npv >= 0 ? 'text-[#1B4D3E]' : 'text-[#a04540]'}`}>
                       {formatCompactIDR(npv)}
                    </h2>
                  </div>
                  <div className="flex gap-2">
                     <div className="px-4 py-2 text-sm font-medium rounded-full bg-slate-200 text-slate-700">20y</div>
                  </div>
                </div>
                <div className="flex-1 min-h-0 -mx-2 h-full">
                  <CashFlowChart projectionData={projectionData} />
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (Narrow Sidebar) */}
            <div className="w-full xl:w-[28%] p-6 lg:p-10 flex flex-col gap-8">
              
              <div className="flex-1 flex flex-col gap-6">
                <SystemSpecsForm 
                  dailyLoad={dailyLoad} setDailyLoad={setDailyLoad}
                  daysOfAutonomy={daysOfAutonomy} setDaysOfAutonomy={setDaysOfAutonomy}
                  systemCapacity={systemCapacity} setSystemCapacity={setSystemCapacity}
                  isPvSufficient={isPvSufficient}
                  minPvRequired={minPvRequired}
                  vSys={V_SYS}
                />
                <FinancialInputs 
                  subsidy={subsidy} setSubsidy={setSubsidy}
                  bumdesTariff={bumdesTariff} setBumdesTariff={setBumdesTariff}
                  capexPv={capexPv} setCapexPv={setCapexPv}
                />
              </div>
              
            </div>
          </div>

          {/* KPI Summary Grid (Bottom, Full Width) */}
          <div className="w-full p-6 lg:px-10 lg:pb-10 lg:pt-0">
            <h3 className="font-bold text-lg text-slate-900 mb-4 hidden">Summary</h3>
            <KPISummary 
              grossCapex={grossCapex}
              netCapex={netCapex}
              batteryCapacityKwh={batteryCapacityKwh}
              npv={npv}
              lcoe={lcoe}
              paybackPeriod={paybackPeriod}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
