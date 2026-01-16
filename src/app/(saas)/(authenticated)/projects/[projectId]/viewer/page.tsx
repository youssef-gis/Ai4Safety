import { Suspense } from "react";
import { getProject } from "@/features/project/queries/get-project";
import { getInspections } from "@/features/inspection/queries/get-inspections";
import { getAnalysis } from "@/features/analysis/actions/get-analysis";
import { ProjectBreadCrumbs } from "../_navigation/tabs";
import { Spinner } from "@/components/spinner";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { getDefectPermissions } from "@/features/defects/permissions/get-defect-permissions";
import { notFound, redirect } from "next/navigation";
import { MapLayer } from "@/components/3D_Viewer/types/map";
import { AnalysisLayout } from "@/features/analysis/components/analysis-layout";
import { LucideBox, LucidePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { inspectionsCreatePath } from "@/path";

type PageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ inspectionId?: string }>;
};

export default async function ProjectViewerPage({ params, searchParams }: PageProps) {
  const { projectId } = await params;
  const { inspectionId } = await searchParams; // Read from URL query param ?inspectionId=...

  // 1. Auth & Permissions
  const { user, activeOrganization } = await getAuthOrRedirect();
  const permissions = await getDefectPermissions({
    userId: user.id,
    organizationId: activeOrganization?.id
  });

  // 2. Fetch Project & List of Inspections (for the timeline/selector)
  const [projectResult, inspections] = await Promise.all([
    getProject(projectId),
    getInspections(projectId)
  ]);

      // Handle null or ActionState (error) cases
    if (!projectResult || !('name' in projectResult)) {
          return notFound();
      }
    const project = projectResult;
    if(!project) return null

    if (inspections.length === 0) {
    return (
        <div className="flex flex-col h-[calc(100vh-60px)] items-center justify-center bg-muted/10">
            <div className="text-center space-y-5 max-w-md p-8 border border-dashed border-border rounded-xl bg-card shadow-sm">
                <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <LucideBox className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-xl font-bold">Initialize Digital Twin</h2>
                    <p className="text-sm text-muted-foreground">
                        This project is empty. Upload your first set of drone imagery to generate the 3D model.
                    </p>
                </div>

                <Button asChild size="lg" className="w-full">
                    <Link href={inspectionsCreatePath(projectId)}>
                        <LucidePlus className="mr-2 h-4 w-4" />
                        Upload Drone Data
                    </Link>
                </Button>
            </div>
        </div>
        );
    }
    const sortedInspections = inspections.sort((a, b) => 
    new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime()
  );
  
    const activeInspectionId = inspectionId || sortedInspections[0]?.id;

    if (!activeInspectionId) {
        return (
            <div className="flex flex-col h-full items-center justify-center gap-4">
                <h2 className="text-xl font-semibold">No 3D Models Available</h2>
                <p className="text-muted-foreground">Upload your first drone inspection to enter the 3D Viewer.</p>
            </div>
        );
    }

    // 4. Fetch Data for the ACTIVE Inspection
    // (In the future, you might fetch *multiple* analyses to compare them)
    const analysis = await getAnalysis(activeInspectionId);
    
    if (!analysis) {
        return <div>Active analysis data not found.</div>;
    }

    // 5. Construct Asset URLs (Dynamic based on Active Inspection)
    const apiBaseUrl = `/api/tiles/${activeOrganization?.id}/${projectId}/${activeInspectionId}`;
    const tilesetUrl = `/model/tileset.json`;
    const camerasUrl = `/shots.geojson`; 
    
    // Define Layers
    const layers: MapLayer[] = []; // Populate if you have distinct layers

    return (
        <div className="flex flex-col h-[calc(100vh-60px)] w-full overflow-hidden">
        
        {/* HEADER: Shows Project Name & Timeline Selector */}
        <div className="flex-none h-14 px-4 flex items-center justify-between border-b border-border bg-background z-10">
            <div className="flex flex-col">
                <ProjectBreadCrumbs 
                    projectName={project.name || "Project"} 
                    inspectionTitle="3D Hub" // Fixed Title
                />
            </div>
            
            {/*Add a Dropdown here to switch ?inspectionId=... */}
            <div className="text-sm text-muted-foreground">
                Viewing: <span className="font-medium text-foreground">{analysis.inspection.title}</span>
            </div>
        </div>

        {/* MAIN VIEWER */}
        <div className="flex-1 min-h-0 w-full relative no-scrollbar">
            <Suspense fallback={<Spinner/>} >
                <AnalysisLayout 
                projectId={projectId}
                inspectionId={activeInspectionId}
                tilesetUrl={tilesetUrl}
                camerasUrl={camerasUrl} 
                proxyBaseUrl={apiBaseUrl}
                layers={layers}
                initialDetections={analysis.detections}
                canDeleteDefect={permissions.canDeleteDefect}
                canEditDefect={permissions.canEditDefect}
                />
            </Suspense>
        </div>
        </div>
    );
}