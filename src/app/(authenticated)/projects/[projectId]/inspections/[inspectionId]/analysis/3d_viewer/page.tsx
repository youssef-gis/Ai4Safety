import Heading from "@/components/heading";
import { AnalysisTabs } from "../_navigation/tabs";
import { Analysis3DViewer } from "@/features/analysis/components/analysis_3d_viewer";


type TabularAnalysisPageProps = {
    params: Promise<{projectId: string, inspectionId: string}>;
};
const Analysis3DViewerPage = async ({params}:TabularAnalysisPageProps) => {
    
   const {projectId, inspectionId}= await params;
   const tilesetUrl=  "/model/tileset.json"
;    return ( 
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
            <div className="flex-1 relative overflow-hidden">
                <Analysis3DViewer tilesetUrl = {tilesetUrl} />
            </div>
           
            
        </div>
     );
}
 
export default Analysis3DViewerPage;