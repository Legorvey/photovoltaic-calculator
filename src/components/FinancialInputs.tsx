import React from 'react';
import { formatIDR } from '../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';

interface FinancialInputsProps {
  plnTariff: number;
  setPlnTariff: (val: number) => void;
  tariffInflation: number;
  setTariffInflation: (val: number) => void;
  capexPerKWp: number;
  setCapexPerKWp: (val: number) => void;
}

export default function FinancialInputs({
  plnTariff, setPlnTariff,
  tariffInflation, setTariffInflation,
  capexPerKWp, setCapexPerKWp
}: FinancialInputsProps) {
  return (
    <Card className="rounded-3xl border-slate-100 bg-slate-50 shadow-sm print:shadow-none print:border-none print:p-0">
      <CardHeader className="p-6 pb-2 print:hidden">
        <CardTitle className="text-base font-bold text-slate-900">Financial Assumptions</CardTitle>
        <CardDescription className="text-xs">Grid pricing and capital expenditure</CardDescription>
      </CardHeader>

      <CardContent className="p-6 pt-4 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="plnTariff" className="text-sm font-medium text-slate-700">
            Grid Electricity Tariff (IDR/kWh)
          </Label>
          <Input
            type="number"
            id="plnTariff"
            value={plnTariff}
            onChange={(e) => setPlnTariff(Number(e.target.value))}
            className="w-full bg-slate-50 border-slate-200 h-8 text-sm"
          />
          <span className="hidden print:block text-base font-semibold text-slate-900">{formatIDR(plnTariff)}/kWh</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center print:block">
            <Label htmlFor="tariffInflation" className="text-sm font-medium text-slate-700">
              Annual Tariff Inflation
            </Label>
            <span className="text-xs font-medium text-slate-700 print:hidden bg-slate-100 px-2 py-0.5 rounded">{tariffInflation}%</span>
          </div>
          <div className="print:hidden">
            <Slider
              id="tariffInflation"
              min={0}
              max={10}
              step={0.1}
              value={[tariffInflation]}
              onValueChange={([val]) => setTariffInflation(val)}
              className="py-1"
            />
          </div>
          <span className="hidden print:block text-base font-semibold text-slate-900">{tariffInflation}% / year</span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="capexPerKWp" className="text-sm font-medium text-slate-700">
            Installation Cost (CAPEX) per kWp
          </Label>
          <Input
            type="number"
            id="capexPerKWp"
            value={capexPerKWp}
            onChange={(e) => setCapexPerKWp(Number(e.target.value))}
            className="w-full bg-slate-50 border-slate-200 h-8 text-sm"
          />
          <p className="text-[10px] text-slate-500 text-right print:hidden">Total installation cost factor</p>
          <span className="hidden print:block text-base font-semibold text-slate-900">{formatIDR(capexPerKWp)}/kWp</span>
        </div>
      </CardContent>
    </Card>
  );
}
