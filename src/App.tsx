import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { YearlyData } from './types';
import Header from './components/Header';
import SystemSpecsForm from './components/SystemSpecsForm';
import FinancialInputs from './components/FinancialInputs';
import KPISummary from './components/KPISummary';
import CashFlowChart from './components/CashFlowChart';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { AlertTriangle } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-100 p-2 md:p-6 lg:p-8 flex justify-center font-sans text-slate-800 print:bg-white print:p-0">
      <div className="w-full max-w-[1500px] bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
        <div ref={componentRef} className="flex flex-col xl:flex-row min-h-[900px] print:flex-col print:p-8">
          
          {/* LEFT COLUMN (Wide) */}
          <div className="w-full xl:w-[72%] p-6 lg:p-10 flex flex-col border-r border-slate-100 gap-6">
            
            {/* Top Header - mimicking the top nav */}
            <div className="flex justify-between items-center mb-2">
              <Header handlePrint={handlePrint} />
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
              <div className="flex-1 -mx-2">
                <CashFlowChart projectionData={projectionData} />
              </div>
            </div>

            {/* Bottom Area: Inputs (Mimics the 4 bottom cards in Picture 1) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* RIGHT COLUMN (Narrow Sidebar) */}
          <div className="w-full xl:w-[28%] bg-slate-50 p-6 lg:p-10 flex flex-col gap-8">
            
            {/* Risk Score */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-xl font-bold text-slate-900 leading-tight mb-4">Financial<br/>Risk Score</h3>
              {npv < 0 ? (
                <Alert variant="default" className="bg-[#fffbeb] border-[#fde68a] text-[#92400e] px-4 py-4 rounded-2xl">
                  <AlertTriangle className="size-5 stroke-[#92400e] mr-2" />
                  <AlertTitle className="text-[#92400e] font-bold text-sm mb-1">High Risk</AlertTitle>
                  <AlertDescription className="text-xs">
                    The Net Present Value is negative. Projected cash flows do not cover the initial capital expenditure.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] px-4 py-4 rounded-2xl flex items-start">
                  <div className="mr-3 mt-0.5 w-5 h-5 rounded-full bg-[#166534] flex-shrink-0 flex items-center justify-center text-white text-xs">✓</div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">Low Risk</h4>
                    <p className="text-xs">Project is financially viable with positive return over 20 years.</p>
                  </div>
                </div>
              )}
            </div>

            {/* KPI Summary (Transactions grid equivalent) */}
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-end mb-5">
                <h3 className="font-bold text-lg text-slate-900">Summary</h3>
              </div>
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
    </div>
  );
}
