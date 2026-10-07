import React from 'react';
import { formatNumber } from '../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';

const MAX_SYSTEM_CAPACITY_KWP = 50;

interface SystemSpecsFormProps {
  dailyLoad: number;
  setDailyLoad: (val: number) => void;
  daysOfAutonomy: number;
  setDaysOfAutonomy: (val: number) => void;
  systemCapacity: number;
  setSystemCapacity: (val: number) => void;
  isPvSufficient: boolean;
  minPvRequired: number;
  vSys: number;
}

export default function SystemSpecsForm({
  dailyLoad, setDailyLoad,
  daysOfAutonomy, setDaysOfAutonomy,
  systemCapacity, setSystemCapacity,
  isPvSufficient, minPvRequired, vSys
}: SystemSpecsFormProps) {
  return (
    <Card className="rounded-3xl border-slate-100 bg-slate-50 shadow-sm print:shadow-none print:border-none print:p-0">
      <CardHeader className="p-6 pb-2 print:hidden flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-bold text-slate-900">System Specifications</CardTitle>
          <CardDescription className="text-xs">Load, storage and PV sizing</CardDescription>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          SYS {vSys}V DC
        </span>
      </CardHeader>

      <CardContent className="p-6 pt-4 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="dailyLoad" className="text-sm font-medium text-slate-700">
            Daily Load Energy (kWh/day)
          </Label>
          <Input
            type="number"
            id="dailyLoad"
            min={0}
            step={0.1}
            value={dailyLoad}
            onChange={(e) => setDailyLoad(Number(e.target.value))}
            className="w-full bg-slate-50 border-slate-200 h-8 text-sm"
          />
          <span className="hidden print:block text-base font-semibold text-slate-900">{formatNumber(dailyLoad, 1)} kWh/day</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center print:block">
            <Label htmlFor="systemCapacity" className="text-sm font-medium text-slate-700">
              System Capacity
            </Label>
            <span className="text-xs font-medium text-slate-700 print:hidden bg-slate-100 px-2 py-0.5 rounded">{systemCapacity} kWp</span>
          </div>
          <div className="print:hidden w-full">
            <Slider
              id="systemCapacity"
              min={0.1}
              max={MAX_SYSTEM_CAPACITY_KWP}
              step={0.1}
              value={[systemCapacity]}
              onValueChange={([val]) => setSystemCapacity(val)}
              className="py-1"
            />
          </div>
          {!isPvSufficient && (
            <p className="text-[10px] text-[#a04540] text-right">
              Warning: Capacity is below the required minimum of {minPvRequired.toFixed(1)} kWp.
            </p>
          )}
          <span className="hidden print:block text-base font-semibold text-slate-900">{systemCapacity} kWp</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center print:block">
            <Label htmlFor="daysOfAutonomy" className="text-sm font-medium text-slate-700">
              Days of Autonomy (1-5 days)
            </Label>
            <span className="text-xs font-medium text-slate-700 print:hidden bg-slate-100 px-2 py-0.5 rounded">{daysOfAutonomy} days</span>
          </div>
          <div className="print:hidden w-full">
            <Slider
              id="daysOfAutonomy"
              min={1}
              max={5}
              step={1}
              value={[daysOfAutonomy]}
              onValueChange={([val]) => setDaysOfAutonomy(val)}
              className="py-1"
            />
          </div>
          <span className="hidden print:block text-base font-semibold text-slate-900">{daysOfAutonomy} days</span>
        </div>
      </CardContent>
    </Card>
  );
}
