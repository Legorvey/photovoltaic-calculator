import React, { useState, useMemo, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { YearlyData } from './types';
import Header from './components/Header';
import SystemSpecsForm from './components/SystemSpecsForm';
import FinancialInputs from './components/FinancialInputs';
import KPISummary from './components/KPISummary';
import CashFlowChart from './components/CashFlowChart';
import { formatCompactIDR } from './utils/formatters';

// --- 1. Hardcoded Engine Constants ---
const EXCHANGE_RATE = 17887; // USD to IDR
const PSH = 4.96; // Peak Sun Hours
const PV_DERATING = 0.80;
const DEGRADATION_RATE = 0.005; // 0.5% per year
const V_SYS = 48; // System Voltage (V)
const DOD = 0.80; // Depth of Discharge
const BATTERY_EFFICIENCY = 0.96;
const DISCOUNT_RATE = 0.10; // 10%
const PROJECT_LIFESPAN = 20; // Years
const CAPEX_BATTERY_PER_KWH = 1400000; // IDR/kWh (Sodium-Ion)
const OPEX_RATE_YEAR_1 = 0.02; // 2% of Gross CAPEX
const OPEX_INFLATION = 0.05; // 5% per year
const DIESEL_LCOE_BASELINE_USD = 1.23; // USD/kWh
const BATTERY_REPLACEMENT_YEAR = 10;

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

  // Technical Sizing & Initial Investment
  const minPvRequired = dailyLoad / (PSH * PV_DERATING);
  const isPvSufficient = systemCapacity >= minPvRequired;
  const batteryCapacityKwh = (dailyLoad * daysOfAutonomy) / (DOD * BATTERY_EFFICIENCY);
  const annualEnergyServed = dailyLoad * 365;

  const grossCapex = (systemCapacity * capexPv) + (batteryCapacityKwh * CAPEX_BATTERY_PER_KWH);
  const netCapex = grossCapex * (1 - (subsidy / 100)); // BUMDes out-of-pocket

  // --- 2. The 20-Year Projection Loop ---
  const projectionData = useMemo<YearlyData[]>(() => {
    let cumulative = -netCapex;
    const data: YearlyData[] = [{
      year: 0,
      energyProduced: 0,
      revenue: 0,
      opex: 0,
      batteryReplacement: 0,
      netCashFlow: -netCapex,
      cumulativeCashFlow: cumulative,
    }];

    let currentEnergy = systemCapacity * PSH * 365 * PV_DERATING;
    let currentOpex = grossCapex * OPEX_RATE_YEAR_1;
    const revenue = annualEnergyServed * bumdesTariff;
    const batteryReplacementCost = batteryCapacityKwh * CAPEX_BATTERY_PER_KWH;

    for (let year = 1; year <= PROJECT_LIFESPAN; year++) {
      if (year > 1) {
        currentEnergy = currentEnergy * (1 - DEGRADATION_RATE);
        currentOpex = currentOpex * (1 + OPEX_INFLATION);
      }

      const batteryReplacement = (year === BATTERY_REPLACEMENT_YEAR) ? batteryReplacementCost : 0;
      const netCashFlow = revenue - currentOpex - batteryReplacement;
      cumulative += netCashFlow;

      data.push({
        year,
        energyProduced: currentEnergy,
        revenue,
        opex: currentOpex,
        batteryReplacement,
        netCashFlow,
        cumulativeCashFlow: cumulative,
      });
    }

    return data;
  }, [netCapex, grossCapex, systemCapacity, annualEnergyServed, bumdesTariff, batteryCapacityKwh]);

  // --- 3. KPI Calculations ---
  const { npv, lcoe, paybackPeriod, dieselLcoeIdr, lcoeSavingsPercentage } = useMemo(() => {
    let npvCalc = -netCapex;
    let discountedCosts = 0;
    let discountedEnergy = 0;
    let payback: string | number = "> 20 Years";
    let foundPayback = false;

    for (let T = 1; T <= PROJECT_LIFESPAN; T++) {
      const row = projectionData[T];
      const discountFactor = Math.pow(1 + DISCOUNT_RATE, T);

      // A. Net Present Value (NPV)
      npvCalc += (row.netCashFlow / discountFactor);

      // B. Levelized Cost of Energy (LCOE), based on energy served
      discountedCosts += ((row.opex + row.batteryReplacement) / discountFactor);
      discountedEnergy += (annualEnergyServed / discountFactor);

      // C. Payback Period (Precision Linear Interpolation)
      if (!foundPayback && row.cumulativeCashFlow >= 0) {
        const prevRow = projectionData[T - 1];
        if (prevRow.cumulativeCashFlow < 0) {
          const fraction = Math.abs(prevRow.cumulativeCashFlow) / row.netCashFlow;
          payback = (T - 1) + fraction;
          foundPayback = true;
        }
      }
    }

    const lcoeCalc = discountedEnergy > 0 ? ((grossCapex + discountedCosts) / discountedEnergy) : 0;
    const dieselLcoeIdr = DIESEL_LCOE_BASELINE_USD * EXCHANGE_RATE;
    const lcoeSavingsPercentage = ((dieselLcoeIdr - lcoeCalc) / dieselLcoeIdr) * 100;

    return {
      npv: npvCalc,
      lcoe: lcoeCalc,
      paybackPeriod: typeof payback === 'number' ? `${payback.toFixed(1)} Years` : payback,
      dieselLcoeIdr,
      lcoeSavingsPercentage
    };
  }, [projectionData, netCapex, grossCapex, annualEnergyServed]);

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

              {/* Diesel vs Microgrid Banner */}
              <div className="bg-[#eefcf2] border border-[#d1f4e0] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center text-[#1B4D3E] shadow-sm">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#357a5e] mb-1">Cost Comparison</span>
                  <p className="text-sm">
                    <span className="font-medium text-slate-500 line-through mr-2">Diesel: Rp {dieselLcoeIdr?.toLocaleString('id-ID', { maximumFractionDigits: 0 })}/kWh</span>
                    <span className="font-bold">Microgrid: Rp {lcoe?.toLocaleString('id-ID', { maximumFractionDigits: 0 })}/kWh</span>
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 bg-[#d1f4e0] text-[#1B4D3E] px-3 py-1.5 rounded-lg text-sm font-bold text-center">
                  {lcoeSavingsPercentage?.toFixed(1) || 0}% more cost-effective
                </div>
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
          <div className="w-full p-6 lg:px-10 lg:pb-10 lg:pt-0 bg-white">
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
