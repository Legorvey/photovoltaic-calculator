import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { YearlyData } from './types';
import Header from './components/Header';
import SystemSpecsForm from './components/SystemSpecsForm';
import FinancialInputs from './components/FinancialInputs';
import KPISummary from './components/KPISummary';
import CashFlowChart from './components/CashFlowChart';
import { formatCompactIDR } from './utils/formatters';

// --- 1. Hardcoded Engine Constants ---
const PSH_PER_DAY = 4.10; // Peak Sun Hours
const PERFORMANCE_RATIO = 0.78; // System efficiency
const DEGRADATION_RATE = 0.005; // 0.5% per year
const OPEX_RATE = 0.0125; // 1.25% of CAPEX
const PROJECT_LIFESPAN = 20; // Years
const DISCOUNT_RATE = 0.0607; // 6.07% real discount rate
const INVERTER_REPLACEMENT_RATE = 0.08; // 8% of CAPEX
const INVERTER_REPLACEMENT_YEAR = 10;

export default function App() {
  // Print Ref
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Solar_PV_Feasibility_Report',
  });

  // State Management (Inputs)
  const [plnPowerVA, setPlnPowerVA] = useState<number>(2200);
  const [capacityKWp, setCapacityKWp] = useState<number>(2.2);
  const [selfConsumptionRatio, setSelfConsumptionRatio] = useState<number>(70);
  const [plnTariff, setPlnTariff] = useState<number>(1444.70);
  const [tariffInflation, setTariffInflation] = useState<number>(4);
  const [capexPerKWp, setCapexPerKWp] = useState<number>(16000000);

  // Constraints
  const maxCapacity = useMemo<number>(() => plnPowerVA / 1000, [plnPowerVA]);
  useEffect(() => {
    if (capacityKWp > maxCapacity) {
      setCapacityKWp(maxCapacity);
    }
  }, [maxCapacity, capacityKWp]);

  // Year 1 Baseline Calcs
  const totalCapex = useMemo<number>(() => capacityKWp * capexPerKWp, [capacityKWp, capexPerKWp]);
  const energyYear1 = useMemo<number>(() => capacityKWp * PSH_PER_DAY * 365 * PERFORMANCE_RATIO, [capacityKWp]);
  const savingsYear1 = useMemo<number>(() => energyYear1 * (selfConsumptionRatio / 100) * plnTariff, [energyYear1, selfConsumptionRatio, plnTariff]);

  // --- 2. The 20-Year Projection Loop ---
  const projectionData = useMemo<YearlyData[]>(() => {
    const data: YearlyData[] = [];
    let cumulative = -totalCapex;

    // Year 0 Setup
    data.push({
      year: 0,
      energyProduced: 0,
      tariff: plnTariff,
      savings: 0,
      opex: 0,
      replacementCost: 0,
      totalCost: totalCapex,
      netCashFlow: -totalCapex,
      cumulativeCashFlow: cumulative,
    });

    let currentEnergy = energyYear1;
    let currentTariff = plnTariff;

    // Iterative Generation
    for (let year = 1; year <= PROJECT_LIFESPAN; year++) {
      if (year > 1) {
        currentEnergy = currentEnergy * (1 - DEGRADATION_RATE);
        currentTariff = currentTariff * (1 + tariffInflation / 100);
      }
      
      const savings = currentEnergy * (selfConsumptionRatio / 100) * currentTariff;
      const opex = totalCapex * OPEX_RATE;
      const replacementCost = (year === INVERTER_REPLACEMENT_YEAR) ? (totalCapex * INVERTER_REPLACEMENT_RATE) : 0;
      const totalCost = opex + replacementCost;
      const netCashFlow = savings - totalCost;
      
      cumulative += netCashFlow;

      data.push({
        year,
        energyProduced: currentEnergy,
        tariff: currentTariff,
        savings,
        opex,
        replacementCost,
        totalCost,
        netCashFlow,
        cumulativeCashFlow: cumulative,
      });
    }

    return data;
  }, [totalCapex, energyYear1, plnTariff, tariffInflation, selfConsumptionRatio]);

  // --- 3. KPI Calculations ---
  const { npv, lcoe, paybackPeriod } = useMemo(() => {
    if (projectionData.length === 0) return { npv: 0, lcoe: 0, paybackPeriod: "> 20 Years" };

    let npvCalc = 0;
    let lcoeNumerator = 0;
    let lcoeDenominator = 0;
    let payback: string | number = "> 20 Years";
    let foundPayback = false;

    for (let i = 0; i <= PROJECT_LIFESPAN; i++) {
      const row = projectionData[i];
      const discountFactor = Math.pow(1 + DISCOUNT_RATE, row.year);

      npvCalc += (row.netCashFlow / discountFactor);
      lcoeNumerator += (row.totalCost / discountFactor);
      if (row.year > 0) {
        lcoeDenominator += (row.energyProduced / discountFactor);
      }

      if (!foundPayback && row.cumulativeCashFlow > 0 && row.year > 0) {
        const prevRow = projectionData[i - 1];
        if (prevRow.cumulativeCashFlow < 0) {
          const fraction = Math.abs(prevRow.cumulativeCashFlow) / row.netCashFlow;
          payback = prevRow.year + fraction;
          foundPayback = true;
        }
      }
    }

    const lcoeCalc = lcoeDenominator > 0 ? (lcoeNumerator / lcoeDenominator) : 0;

    return {
      npv: npvCalc,
      lcoe: lcoeCalc,
      paybackPeriod: typeof payback === 'number' ? `${payback.toFixed(1)} Years` : payback,
    };
  }, [projectionData]);

  return (
    <div className="min-h-screen bg-white flex justify-center items-center font-sans text-slate-800">
      <div className="w-full max-w-[1500px] my-auto">
        <div ref={componentRef} className="flex flex-col print:flex-col print:p-8">
          
          <div className="flex flex-col xl:flex-row flex-1">
            {/* LEFT COLUMN (Wide) */}
            <div className="w-full xl:w-[72%] p-6 lg:p-10 flex flex-col gap-6">
              
              {/* Top Header */}
              <div className="flex justify-between items-center mb-2">
                <Header handlePrint={handlePrint} npv={npv} />
              </div>

              {/* Main Chart Area */}
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex-1 flex flex-col shadow-sm min-h-[500px]">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-slate-500 font-medium">Net Present Value</p>
                    <h2 className={`text-4xl lg:text-5xl font-bold tracking-tighter mt-1 ${npv >= 0 ? 'text-[#1B4D3E]' : 'text-[#a04540]'}`}>
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
            <div className="w-full xl:w-[28%] bg-white p-6 lg:p-10 flex flex-col gap-8">
              
              <div className="flex-1 flex flex-col gap-6">
                <SystemSpecsForm 
                  plnPowerVA={plnPowerVA} setPlnPowerVA={setPlnPowerVA}
                  capacityKWp={capacityKWp} setCapacityKWp={setCapacityKWp}
                  maxCapacity={maxCapacity}
                  selfConsumptionRatio={selfConsumptionRatio} setSelfConsumptionRatio={setSelfConsumptionRatio}
                />
                <FinancialInputs 
                  plnTariff={plnTariff} setPlnTariff={setPlnTariff}
                  tariffInflation={tariffInflation} setTariffInflation={setTariffInflation}
                  capexPerKWp={capexPerKWp} setCapexPerKWp={setCapexPerKWp}
                />
              </div>
              
            </div>
          </div>

          {/* KPI Summary Grid (Bottom, Full Width) */}
          <div className="w-full p-6 lg:px-10 lg:pb-10 lg:pt-0 bg-white">
            <h3 className="font-bold text-lg text-slate-900 mb-4 hidden">Summary</h3>
            <KPISummary 
              totalCapex={totalCapex}
              energyYear1={energyYear1}
              savingsYear1={savingsYear1}
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
