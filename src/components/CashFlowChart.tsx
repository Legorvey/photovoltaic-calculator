import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, Cell } from 'recharts';
import { YearlyData } from '../types';
import { formatCompactIDR, formatIDR } from '../utils/formatters';

interface CashFlowChartProps {
  projectionData: YearlyData[];
}

export default function CashFlowChart({ projectionData }: CashFlowChartProps) {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            
            <Bar dataKey="netCashFlow" name="Net Cash Flow" radius={[2, 2, 0, 0]} maxBarSize={40}>
              {projectionData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.year === 0 || entry.netCashFlow < 0 ? '#cb5a5e' : '#659c7a'} 
                />
              ))}
            </Bar>
            
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
