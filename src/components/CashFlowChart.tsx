import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { YearlyData } from '../types';
import { formatCompactIDR, formatIDR } from '../utils/formatters';

interface CashFlowChartProps {
  projectionData: YearlyData[];
}

export default function CashFlowChart({ projectionData }: CashFlowChartProps) {
  const chartData = projectionData.map(row => ({
    ...row,
    opexOutflow: -row.opex,
    batteryOutflow: -row.batteryReplacement,
    initialCapexOutflow: row.year === 0 ? row.netCashFlow : 0,
  }));

  return (
    <div className="w-full" style={{ height: '400px', minHeight: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} stackOffset="sign" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="year" 
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis 
              tickFormatter={(value) => formatCompactIDR(value)}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip 
              formatter={(value: any) => formatIDR(Number(value))}
              labelFormatter={(label) => `Year ${label}`}
              contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />
            
            <Bar dataKey="revenue" name="Revenue" stackId="cashFlow" fill="#659c7a" maxBarSize={40} />
            <Bar dataKey="initialCapexOutflow" name="Net CAPEX" stackId="cashFlow" fill="#cb5a5e" maxBarSize={40} />
            <Bar dataKey="opexOutflow" name="OPEX" stackId="cashFlow" fill="#cb5a5e" maxBarSize={40} />
            <Bar dataKey="batteryOutflow" name="Battery Replacement" stackId="cashFlow" fill="#a04540" maxBarSize={40} />
            
            <Line 
              type="monotone" 
              dataKey="cumulativeCashFlow" 
              name="Cumulative Cash Flow" 
              stroke="#1e293b" 
              strokeWidth={3} 
              dot={{ r: 3, fill: '#1e293b', strokeWidth: 2, stroke: '#ffffff' }} 
              activeDot={{ r: 6 }} 
            />
          </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
