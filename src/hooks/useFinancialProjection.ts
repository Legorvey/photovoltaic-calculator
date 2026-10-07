import { useMemo } from 'react';
import { YearlyData } from '../types';
import {
  PSH,
  PV_DERATING,
  DOD,
  BATTERY_EFFICIENCY,
  CAPEX_BATTERY_PER_KWH,
  OPEX_RATE_YEAR_1,
  OPEX_INFLATION,
  PROJECT_LIFESPAN,
  DEGRADATION_RATE,
  BATTERY_REPLACEMENT_YEAR,
  DISCOUNT_RATE,
  DIESEL_LCOE_BASELINE_USD,
  EXCHANGE_RATE,
} from '../constants/engine';

interface FinancialProjectionParams {
  dailyLoad: number;
  daysOfAutonomy: number;
  subsidy: number;
  bumdesTariff: number;
  systemCapacity: number;
  capexPv: number;
}

export const useFinancialProjection = ({
  dailyLoad,
  daysOfAutonomy,
  subsidy,
  bumdesTariff,
  systemCapacity,
  capexPv,
}: FinancialProjectionParams) => {
  // Technical Sizing & Initial Investment
  const minPvRequired = dailyLoad / (PSH * PV_DERATING);
  const isPvSufficient = systemCapacity >= minPvRequired;
  const batteryCapacityKwh = (dailyLoad * daysOfAutonomy) / (DOD * BATTERY_EFFICIENCY);
  const annualEnergyServed = dailyLoad * 365;

  const grossCapex = (systemCapacity * capexPv) + (batteryCapacityKwh * CAPEX_BATTERY_PER_KWH);
  const netCapex = grossCapex * (1 - (subsidy / 100)); // BUMDes out-of-pocket

  // The 20-Year Projection Loop
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

  // KPI Calculations
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
    const currentDieselLcoeIdr = DIESEL_LCOE_BASELINE_USD * EXCHANGE_RATE;
    const currentLcoeSavingsPercentage = ((currentDieselLcoeIdr - lcoeCalc) / currentDieselLcoeIdr) * 100;

    return {
      npv: npvCalc,
      lcoe: lcoeCalc,
      paybackPeriod: typeof payback === 'number' ? `${payback.toFixed(1)} Years` : payback,
      dieselLcoeIdr: currentDieselLcoeIdr,
      lcoeSavingsPercentage: currentLcoeSavingsPercentage
    };
  }, [projectionData, netCapex, grossCapex, annualEnergyServed]);

  return {
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
  };
};
