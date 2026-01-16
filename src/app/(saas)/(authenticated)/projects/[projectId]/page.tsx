
// import { Breadcrumbs } from '@/components/breadcrumbs';
// import Heading from '@/components/heading';
// import { Separator } from '@/components/ui/separator';
// import { Attachments } from '@/features/attachments/components/attachments';
// import { Comments } from '@/features/comment/components/comments/comments';
// import { getComments } from '@/features/comment/queries/get-comments';
// import { ProjectItem } from '@/features/project/components/project-item';
// import { getProject } from '@/features/project/queries/get-project';

// import { notFound } from 'next/navigation';
// import { ProjectBreadCrumbs } from './_navigation/tabs';

// type ProjectPageProps= {
//     params:{
//         projectId: string,
//     }
// }


// const  ProjectPage = async ({params}:ProjectPageProps) => {
//   const { projectId } = await params;
//   const projectPromise = getProject(projectId);
//   const commentsPromise = getComments(projectId);


//   const [project, paginatedComments] = await Promise.all([
//     projectPromise,
//     commentsPromise,
//   ]);
    
//     if(!project){
//         return(
//             notFound()
//         )
//     }
//     return (
//       <div className='flex-1 flex flex-col gap-y-8'>
//          <Heading title='Project Dashboard' 
//             description='Real-time safety intelligence and inspection history.'
//             tabs={< ProjectBreadCrumbs />}
             
//           />
       

//         <div className='flex justify-center' >
//           <ProjectItem project={project} isDetail
//           //   attachments={
//           //     <Attachments entityId={ticket.id} 
//           //       entity="TICKET" 
//           //       isOwner={ticket.isOwner} />
//           //   }
//           //   referencedTickets = {<ReferencedTickets ticketId={ticket.id}/>} 
//           //   comments={
//           //   <Comments
//           //     ticketId={ticket.id}
//           //     paginatedComments={paginatedComments}
//           //   />
//           // }
//           />
//         </div>
//        </div>
        
//      );
// }
 
// export default ProjectPage;


    

import { InspectionList } from "@/features/inspection/components/inspection-list";
import { Suspense } from "react";
import { Spinner } from "@/components/spinner";
import { ProjectStats, ProjectStatsType } from "@/features/project/components/project-stats";
import { ProjectTrendChart, ChartDataPoint } from "@/features/project/components/project-trend-chart";
//import { getProjectAnalytics } from "@/features/project/queries/get-project-analytics";
import { Button } from "@/components/ui/button";
import { LucideDownload, LucideCalendarDays, LucideBox, LucidePlus } from "lucide-react";
import Heading from "@/components/heading";
import { ProjectBreadCrumbs } from "./_navigation/tabs";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { getProject } from "@/features/project/queries/get-project";
import { getInspectionPermissions } from "@/features/inspection/permissions/get-inspection-permissions";
import { toActionState } from "@/components/forms/utils/to-action-state";
import notFound from "./not-found";
import Link from "next/link";
import { inspectionsCreatePath, projectViewerPath } from "@/path";
import { getInspections } from "@/features/inspection/queries/get-inspections";

// --- MOCK DATA GENERATOR (For UI Dev) ---
const MOCK_STATS: ProjectStatsType = {
    healthScore: 82,
    criticalCount: 2,
    totalDefects: 145,
    totalInspections: 12,
    resolvedCount: 118
};

const MOCK_CHART_DATA: ChartDataPoint[] = [
    { date: 'Jun 2024', critical: 5, open: 12, resolved: 8 },
    { date: 'Jul 2024', critical: 3, open: 15, resolved: 20 },
    { date: 'Aug 2024', critical: 4, open: 8, resolved: 25 },
    { date: 'Sep 2024', critical: 1, open: 5, resolved: 30 },
    { date: 'Oct 2024', critical: 0, open: 4, resolved: 12 },
    { date: 'Nov 2024', critical: 2, open: 6, resolved: 18 },
];
// ----------------------------------------

export default  async  function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    
    const {user, activeOrganization}= await getAuthOrRedirect();
            
    if (!user || !activeOrganization) {
        return toActionState('Error', 'Not Authenticated');
    }
            
    const permissions = await getInspectionPermissions({
        userId: user.id,
        organizationId: activeOrganization.id
     });

    const projectResult = await getProject(projectId);

    // Handle null or ActionState (error) cases
    if (!projectResult || !('name' in projectResult)) {
        return notFound();
    }

    
    const project = projectResult;
    if(!project) return null

    const inspections = await getInspections(projectId);
    const hasData = inspections.length > 0;
    
    // const { chartData, kpi } = await getProjectAnalytics(projectId);
    
    // For now, use mocks to verify UI
    const chartData = MOCK_CHART_DATA;
    const kpi = MOCK_STATS;

    return (
        <div className="flex-1 flex flex-col gap-y-8 pb-10">
            
            {/* 1. Header with Actions */}
            <Heading 
                title="Project Dashboard" 
                description="Real-time safety intelligence and inspection history." 
                tabs={<ProjectBreadCrumbs  projectName={project.name || "Project"}/>} 
                actions={
                    <div className="flex gap-2">
                        <Button 
                            asChild 
                            disabled={!hasData} // Optional: Visually disable if empty
                            variant={!hasData ? "ghost" : "default"} // Optional: Make it subtle
                        >
                            {hasData ? (
                                <Link href={projectViewerPath(projectId)}>
                                    <LucideBox className="mr-2 h-4 w-4" />
                                    Open 3D Digital Twin
                                </Link>
                            ) : (
                                /* Render a span or disabled button if you don't want them to click */
                                <span className="flex items-center text-muted-foreground cursor-not-allowed">
                                    <LucideBox className="mr-2 h-4 w-4" />
                                    Open 3D Digital Twin
                                </span>
                            )}
                        </Button>
                    </div>
                }
            />

            {!hasData ? (
                <div className="flex flex-col items-center justify-center py-12 bg-card border rounded-xl shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <LucideBox className="w-8 h-8 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Project Setup Incomplete</h2>
                    <p className="text-muted-foreground max-w-md text-center mb-8 mt-2">
                        This project has no data. To unlock the 3D Digital Twin, Analytics, and Defect Reporting, you need to import your first dataset.
                    </p>
                    {permissions.canEditInspection && (
                        <Button asChild size="lg">
                            <Link href={inspectionsCreatePath(projectId)}>
                                <LucidePlus className="w-4 h-4 mr-2" />
                                Upload Drone Data
                            </Link>
                        </Button>
                    )}
                </div>
            ) : (
                <>
                {/* 2. Top KPI Layer */}
                <ProjectStats stats={kpi} />

                {/* 3. Middle Intelligence Layer */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Trend Chart (2/3 width) */}
                    <div className="lg:col-span-2">
                        <ProjectTrendChart data={chartData} />
                    </div>

                    {/* Quick Activity Feed (1/3 width) */}
                    <div className="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col h-[425px]">
                        <h3 className="font-semibold mb-4 text-foreground">Recent Activity</h3>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                            {/* Mock Feed Items */}
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex gap-4 relative">
                                    {/* Timeline Line */}
                                    {i !== 4 && <div className="absolute left-[11px] top-8 bottom-[-24px] w-[2px] bg-border" />}
                                    
                                    <div className="relative z-10 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Critical Crack Detected</p>
                                        <p className="text-xs text-muted-foreground mb-1">Inspection #{1000 + i} • 2 hours ago</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 bg-muted p-2 rounded">
                                            AI detected a 5mm spalling crack on the North Facade.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" size="sm" className="w-full mt-4 text-xs">
                            View All Activity
                        </Button>
                    </div>
                </div>

                {/* Bottom Data Layer */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold tracking-tight">Inspection Flight Logs</h3>
                    </div>
                    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                        <Suspense fallback={<div className="p-8"><Spinner /></div>}>
                            <InspectionList userId="" projectId={projectId} canDelete={permissions.canDeleteInspection} />
                        </Suspense>
                    </div>
                </div>
                </>
            )}
        </div>
    );
}   