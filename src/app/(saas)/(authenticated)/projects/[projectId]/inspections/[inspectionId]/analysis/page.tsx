
import { getAnalysis } from "@/features/analysis/actions/get-analysis";
import { AnalysisLayout } from "./analysis-layout"; 
import { ProjectBreadCrumbs } from "../../../_navigation/tabs";
import { Suspense } from "react";
import { Spinner } from "@/components/spinner";
import { InspectionActions } from "@/features/inspection/components/inspection-actions";

type PageProps = {
  params: Promise<{ projectId: string; inspectionId: string }>;
};

// Server Component fetches data
export default async function AnalysisPage({ params }: PageProps) {
  const { projectId, inspectionId } = await params;
  
  // Fetch Analysis (Tileset + Detections)
  const analysis = await getAnalysis(inspectionId);
  console.log('Inspection ID:', inspectionId);
  console.log('Project ID:', projectId);
  console.log('Analysis Data:', analysis);

  const tilesetUrl = "/model/tileset.json"; // Or from analysis object

  if (!analysis) return <div>Analysis not found</div>;

  return (
    // h-[calc(100vh-60px)]
    <div className="flex flex-col h-[calc(100vh-60px)] w-full overflow-hidden">
    
      <div className="flex-none h-10 px-4 flex items-center justify-between border-b border-slate-800 bg-transparent z-10">
         <ProjectBreadCrumbs />
         <InspectionActions inspectionId={inspectionId} defects={analysis.detections} projectName={analysis.inspection.project.name} />
      </div>

      <div className="flex-1 min-h-0 w-full relative no-scrollbar">
        <Suspense fallback={<Spinner/>} >
            <AnalysisLayout 
              projectId={projectId}
              inspectionId={inspectionId}
              tilesetUrl={tilesetUrl}
              initialDetections={analysis.detections}
            />
        </Suspense>
      </div>
    </div>
  );
}