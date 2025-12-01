import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideActivity, LucideAlertOctagon, LucideCheckCircle2, LucideTrendingUp, LucideDrone } from "lucide-react";

export type ProjectStatsType = {
    totalInspections: number;
    totalDefects: number;
    criticalCount: number;
    resolvedCount: number;
    healthScore: number;
}

export const ProjectStats = ({ stats }: { stats: ProjectStatsType }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* 1. Health Score */}
      <Card className="border-l-4 border-l-blue-600 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Site Health Score</CardTitle>
          <LucideActivity className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className={`text-2xl font-bold ${stats.healthScore < 70 ? 'text-red-600' : 'text-slate-900 dark:text-slate-50'}`}>
                {stats.healthScore}%
            </div>
            <span className="text-xs text-muted-foreground">+2.5% from last month</span>
          </div>
          <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-blue-600 rounded-full" style={{ width: `${stats.healthScore}%` }}></div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Critical Risks */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Critical Risks</CardTitle>
          <LucideAlertOctagon className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.criticalCount}</div>
          <p className="text-xs text-muted-foreground">Requires immediate attention</p>
        </CardContent>
      </Card>

      {/* 3. Total Flights */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Flights</CardTitle>
          <LucideDrone className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalInspections}</div>
          <p className="text-xs text-muted-foreground">Last flight: 2 days ago</p>
        </CardContent>
      </Card>

      {/* 4. Resolution Rate */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
          <LucideCheckCircle2 className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">
            {stats.totalDefects > 0 ? Math.round((stats.resolvedCount / stats.totalDefects) * 100) : 100}%
          </div>
          <p className="text-xs text-muted-foreground">{stats.resolvedCount} issues fixed</p>
        </CardContent>
      </Card>
    </div>
  );
};