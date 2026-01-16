'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';


const SEVERITY_DATA = [
  { name: 'Critical', value: 2, color: '#ef4444' },
  { name: 'High', value: 5, color: '#f97316' },
  { name: 'Medium', value: 12, color: '#eab308' },
  { name: 'Low', value: 8, color: '#22c55e' },
];

const TYPE_DATA = [
  { name: 'Spalling', value: 10, color: '#3b82f6' },
  { name: 'Rust', value: 8, color: '#8b5cf6' },
  { name: 'Cracks', value: 5, color: '#ec4899' },
  { name: 'Leaks', value: 4, color: '#14b8a6' },
];

export const InspectionAnalytics = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full p-4">
            <Card className="h-full border-none shadow-none bg-transparent">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Severity Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={SEVERITY_DATA}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {SEVERITY_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none' }}
                                itemStyle={{ color: '#1e293b' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="h-full border-none shadow-none bg-transparent">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Defect Types</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={TYPE_DATA}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {TYPE_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none' }}
                                itemStyle={{ color: '#1e293b' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}