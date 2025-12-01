'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export type ChartDataPoint = {
    date: string;
    critical: number;
    open: number;
    resolved: number;
}

type ProjectTrendChartProps = {
    data: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-xl text-sm">
          <p className="font-semibold mb-2 text-popover-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-muted-foreground capitalize">{entry.name}:</span>
                <span className="font-mono font-bold text-popover-foreground">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

export const ProjectTrendChart = ({ data }: ProjectTrendChartProps) => {
    return (
        <Card className="col-span-4 lg:col-span-4 h-full shadow-sm">
            <CardHeader>
                <CardTitle>Inspection Defect Trends</CardTitle>
                <CardDescription>
                    Tracking critical vs. resolved issues over the last 6 months.
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis 
                            dataKey="date" 
                            stroke="#888888" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                            tickMargin={10}
                        />
                        <YAxis 
                            stroke="#888888" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(value) => `${value}`} 
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--accent)', opacity: 0.2}} />
                        <Legend 
                            verticalAlign="top" 
                            height={36} 
                            iconType="circle"
                            formatter={(value) => <span className="text-sm text-muted-foreground ml-1">{value}</span>}
                        />
                        {/* Stacked Bars for a cleaner look */}
                        <Bar dataKey="resolved" name="Resolved" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} barSize={32} />
                        <Bar dataKey="open" name="Open Issues" stackId="a" fill="#eab308" barSize={32} />
                        <Bar dataKey="critical" name="Critical" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}