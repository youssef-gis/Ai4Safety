
import { getAnalysis } from "@/features/analysis/actions/get-analysis";
import { AnalysisLayout } from "./analysis-layout"; 
import { ProjectBreadCrumbs } from "../../../_navigation/tabs";
import { Suspense } from "react";
import { Spinner } from "@/components/spinner";
import { InspectionActions } from "@/features/inspection/components/inspection-actions";
import { InspectionContextBar, InspectionContextType } from "@/features/inspection/components/inspection-context-bar";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { getDefectPermissions } from "@/features/defects/permissions/get-defect-permissions";
import { MapLayer } from "@/components/3D_Viewer/types/map";
import { DetectionSeverity, DetectionStatus, DetectionType } from "@prisma/client";

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
  
  const { user, activeOrganization } = await getAuthOrRedirect();

  const permissions = await getDefectPermissions({
    userId: user.id,
    organizationId: activeOrganization?.id
  });

  // Fetch Analysis (Tileset + Detections)
  const analysis = await getAnalysis(inspectionId);
  console.log('Inspection ID:', inspectionId);
  console.log('Project ID:', projectId);
  console.log('Analysis Data:', analysis);


  //const tilesetUrl = "/model/tileset.json"; // Or from analysis object
  //const tilesetUrl = `/api/tiles/${activeOrganization?.id}/${projectId}/${inspectionId}/tileset.json`;
  // Base URL 
  const apiBaseUrl = `/api/tiles/${activeOrganization?.id}/${projectId}/${inspectionId}`;
  // 1. URL for the 3D Model
  // The API sees .json and maps it to "3d_tiles/model/"
 // const tilesetUrl = `${apiBaseUrl}/tileset.json`;
  const tilesetUrl = `/model/tileset.json`;

  // 2. URL for the Camera Positions
  // The API sees .geojson and maps it to "odm_report/"
   //const camerasUrl = `${apiBaseUrl}/shots.geojson`;
  const camerasUrl = `/shots.geojson`;

  // 3. Base URL for Images (to be passed to children)
  // When you append "/image.jpg", the API maps it to "uploaded_images/"
  const proxyBaseUrl = apiBaseUrl;
  //const proxyBaseUrl = '';
  //  CONSTRUCT THE LAYERS
  const layers: MapLayer[] = [
    // {
    //   id: 'mesh',
    //   name: '3D Mesh',
    //   type: '3D_TILES',
    //   url: `${apiBase}/3d_tiles/model/tileset.json`, 
    //   visible: true,
    //   isBaseLayer: true
    // },
    // {
    //   id: 'ortho',
    //   name: 'Orthophoto',
    //   type: 'IMAGERY',
    //   // Note the {z}/{x}/{y} format for XYZ tiles
    //   url: `${apiBase}/orthophoto/tiles/{z}/{x}/{y}.png`, 
    //   visible: true,
    //   opacity: 0.8
    // },
    // Optional: Point Cloud
    // {
    //   id: 'cloud',
    //   name: 'Point Cloud',
    //   type: 'POINT_CLOUD',
    //   url: `${apiBase}/3d_tiles/pointcloud/tileset.json`,
    //   visible: true
    // }
  ];

  if (!analysis) return <div>Analysis not found</div>;
  const projectName = analysis.inspection.project.name;

//   const detections = analysis.detections.map((d) => ({
//   ...d,
//   type: d.type ?? DetectionType.SPALLING_CRACK, // Provide a default
//   severity: d.severity ?? DetectionSeverity.LOW,
//   status: d.status ?? DetectionStatus.NEW,
// }));


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
              camerasUrl={camerasUrl} 
              proxyBaseUrl= {proxyBaseUrl}
              layers={layers}
              initialDetections={analysis.detections}
              canDeleteDefect={permissions.canDeleteDefect}
              canEditDefect= {permissions.canEditDefect}
            />
        </Suspense>
      </div>
    </div>
  );
}