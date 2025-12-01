
import { getAnalysis } from "@/features/analysis/actions/get-analysis";
import { AnalysisLayout } from "./analysis-layout"; 
import { ProjectBreadCrumbs } from "../../../_navigation/tabs";
import { Suspense } from "react";
import { Spinner } from "@/components/spinner";
import { InspectionActions } from "@/features/inspection/components/inspection-actions";
import { InspectionContextBar, InspectionContextType } from "@/features/inspection/components/inspection-context-bar";

type PageProps = {
  params: Promise<{ projectId: string; inspectionId: string }>;
};

// --- MOCK CONTEXT DATA ---
const MOCK_CONTEXT: InspectionContextType = {
    weather: "Partly Cloudy",
    temperature: "24°C",
    droneModel: "DJI Mavic 3 Thermal",
    aiModelVersion: "v2.4.1 (Concrete)",
    aiConfidence: 94
};
// -------------------------

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
  const projectName = analysis.inspection.project.name;

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] w-full overflow-hidden">
    
      {/* HEADER */}
      <div className="flex-none h-14 px-4 flex items-center justify-between border-b border-border bg-background z-10">
         <div className="flex flex-col">
             <ProjectBreadCrumbs projectName={projectName} />
         </div>
         <InspectionActions inspectionId={inspectionId} defects={analysis.detections} projectName={projectName} />
      </div>

      {/* CONTEXT BAR  */}
      {/* <InspectionContextBar data={MOCK_CONTEXT} /> */}

      {/* MAIN WORKSPACE */}
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