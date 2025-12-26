import Heading from "@/components/heading";
import { AnalysisTabs } from "../_navigation/tabs";
import { Analysis3DViewer } from "@/features/analysis/components/analysis_3d_viewer";
import {getAnalysis} from "@/features/analysis/actions/get-analysis"

type TabularAnalysisPageProps = {
    params: Promise<{projectId: string, inspectionId: string}>;
};
const Analysis3DViewerPage = async ({params}:TabularAnalysisPageProps) => {
    
    const {projectId, inspectionId}= await params;
    const tilesetUrl=  "/model/tileset.json";
    const analysis = await getAnalysis(inspectionId);
    
    if(!analysis) return null;
    
    return ( 
        <div className="flex flex-col ">
             {/* "flex-1 flex flex-col gap-y-8"   flex-col h-screen w-screen*/}
            <div className= "flex-none">
                <Heading title="3D Viewer" 
                description="All your inspection in 3D space " 
                tabs={
                    <AnalysisTabs projectId={projectId} inspectionId={inspectionId} />
                }    
                />
            </div>
             {/* overflow-hidden -1 w-full relative overflow-hidden */}
            <div className="relative" style={{ height: '490px' }}>
                <Analysis3DViewer tilesetUrl={tilesetUrl} inspectionId={inspectionId} initialDetections={analysis.detections} 
                    proxyBaseUrl={""} camerasUrl={"/shots.geojson"} canDeleteDefect={false} 
                    canEditDefect={false} layers={[]}/>
            </div>
           
            
        </div>
     );
}
 
export default Analysis3DViewerPage;