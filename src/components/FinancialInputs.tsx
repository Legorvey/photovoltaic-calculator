import React from 'react';
import { formatIDR } from '../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';

interface FinancialInputsProps {
  subsidy: number;
  setSubsidy: (val: number) => void;
  bumdesTariff: number;
  setBumdesTariff: (val: number) => void;
  capexPv: number;
  setCapexPv: (val: number) => void;
}

export default function FinancialInputs({
  subsidy, setSubsidy,
  bumdesTariff, setBumdesTariff,
  capexPv, setCapexPv
}: FinancialInputsProps) {
  return (
    <Card className="rounded-3xl border-slate-100 bg-slate-50 shadow-sm print:shadow-none print:border-none print:p-0">
      <CardHeader className="p-6 pb-2 print:hidden">
        <CardTitle className="text-base font-bold text-slate-900">Financial Assumptions</CardTitle>
        <CardDescription className="text-xs">Tariff, subsidy and capital expenditure</CardDescription>
      </CardHeader>

      <CardContent className="p-6 pt-4 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="bumdesTariff" className="text-sm font-medium text-slate-700">
            BUMDes Tariff (Rp/kWh)
          </Label>
          <Input
            type="number"
            id="bumdesTariff"
            value={bumdesTariff}
            onChange={(e) => setBumdesTariff(Number(e.target.value))}
            className="w-full bg-slate-50 border-slate-200 h-8 text-sm"
          />
          <span className="hidden print:block text-base font-semibold text-slate-900">{formatIDR(bumdesTariff)}/kWh</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center print:block">
            <Label htmlFor="subsidy" className="text-sm font-medium text-slate-700">
              Government Subsidy (%)
            </Label>
            <span className="text-xs font-medium text-slate-700 print:hidden bg-slate-100 px-2 py-0.5 rounded">{subsidy}%</span>
          </div>
          <div className="print:hidden">
            <Slider
              id="subsidy"
              min={0}
              max={100}
              step={1}
              value={[subsidy]}
              onValueChange={([val]) => setSubsidy(val)}
              className="py-1"
            />
          </div>
          <span className="hidden print:block text-base font-semibold text-slate-900">{subsidy}%</span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="capexPv" className="text-sm font-medium text-slate-700">
            PV Installation Cost (CAPEX) per kWp
          </Label>
          <Input
            type="number"
            id="capexPv"
            value={capexPv}
            onChange={(e) => setCapexPv(Number(e.target.value))}
            className="w-full bg-slate-50 border-slate-200 h-8 text-sm"
          />
          <span className="hidden print:block text-base font-semibold text-slate-900">{formatIDR(capexPv)}/kWp</span>
        </div>
      </CardContent>
    </Card>
  );
}
