import React from 'react';
import { formatNumber } from '../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SystemSpecsFormProps {
  plnPowerVA: number;
  setPlnPowerVA: (val: number) => void;
  capacityKWp: number;
  setCapacityKWp: (val: number) => void;
  maxCapacity: number;
  selfConsumptionRatio: number;
  setSelfConsumptionRatio: (val: number) => void;
}

export default function SystemSpecsForm({
  plnPowerVA, setPlnPowerVA,
  capacityKWp, setCapacityKWp,
  maxCapacity,
  selfConsumptionRatio, setSelfConsumptionRatio
}: SystemSpecsFormProps) {
  const plnPowerOptions = [1300, 2200, 3500, 4400, 5500, 7700, 11000, 16500, 23000];

  return (
    <Card className="rounded-3xl border-slate-100 bg-slate-50 shadow-sm print:shadow-none print:border-none print:p-0">
      <CardHeader className="p-6 pb-2 print:hidden">
        <CardTitle className="text-base font-bold text-slate-900">System Specifications</CardTitle>
        <CardDescription className="text-xs">Configure physical constraints</CardDescription>
      </CardHeader>

      <CardContent className="p-6 pt-4 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="plnPowerVA" className="text-sm font-medium text-slate-700">
            Grid Connection Power (VA)
          </Label>
          <Select
            value={plnPowerVA.toString()}
            onValueChange={(val) => setPlnPowerVA(Number(val))}
          >
            <SelectTrigger id="plnPowerVA" className="w-full bg-slate-50 border-slate-200 h-8 text-sm">
              <SelectValue placeholder="Select Power" />
            </SelectTrigger>
            <SelectContent>
              {plnPowerOptions.map(val => (
                <SelectItem key={val} value={val.toString()}>
                  {formatNumber(val, 0)} VA
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="hidden print:block text-base font-semibold text-slate-900">{formatNumber(plnPowerVA, 0)} VA</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center print:block">
            <Label htmlFor="capacityKWp" className="text-sm font-medium text-slate-700">
              System Capacity
            </Label>
            <span className="text-xs font-medium text-slate-700 print:hidden bg-slate-100 px-2 py-0.5 rounded">{capacityKWp} kWp</span>
          </div>
          <div className="print:hidden w-full">
            <Slider
              id="capacityKWp"
              min={0.1}
              max={maxCapacity}
              step={0.1}
              value={[capacityKWp]}
              onValueChange={([val]) => setCapacityKWp(val)}
              className="py-1"
            />
          </div>
          <p className="text-[10px] text-slate-500 text-right print:hidden">Max limit based on grid power: {maxCapacity} kWp</p>
          <span className="hidden print:block text-base font-semibold text-slate-900">{capacityKWp} kWp</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center print:block">
            <Label htmlFor="selfConsumptionRatio" className="text-sm font-medium text-slate-700">
              Self-Consumption Ratio
            </Label>
            <span className="text-xs font-medium text-slate-700 print:hidden bg-slate-100 px-2 py-0.5 rounded">{selfConsumptionRatio}%</span>
          </div>
          <div className="print:hidden w-full">
            <Slider
              id="selfConsumptionRatio"
              min={0}
              max={100}
              step={1}
              value={[selfConsumptionRatio]}
              onValueChange={([val]) => setSelfConsumptionRatio(val)}
              className="py-1"
            />
          </div>
          <p className="text-[10px] text-slate-500 text-right print:hidden">Estimated % of solar energy used directly</p>
          <span className="hidden print:block text-base font-semibold text-slate-900">{selfConsumptionRatio}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
