import Heading from "@/components/heading";
import { AnalysisTabs } from "../_navigation/tabs";
import DefectTable from "@/features/defects/defect-table";

type TabularAnalysisPageProps = {
    params: Promise<{projectId: string, inspectionId: string}>;
};
const AnalysisTablePage = async ({params}:TabularAnalysisPageProps) => {

    const {projectId, inspectionId}= await params;
    return ( 
        <div className="flex flex-col gap-y-8 ">
            <div className="gap-y-8 " >
                <Heading title="Defects Registry" 
                description="View and manage all defects identified in this inspection." 
                tabs={
                    <AnalysisTabs projectId={projectId} inspectionId={inspectionId} />
                }    
                />
            </div>
            
            <DefectTable inspectionId={inspectionId} />
        </div>
     );
}
 
export default AnalysisTablePage;