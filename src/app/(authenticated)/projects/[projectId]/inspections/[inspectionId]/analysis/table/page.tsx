import Heading from "@/components/heading";
import { AnalysisTabs } from "../_navigation/tabs";

type TabularAnalysisPageProps = {
    params: Promise<{projectId: string, inspectionId: string}>;
};
const AnalysisTablePage = async ({params}:TabularAnalysisPageProps) => {

    const {projectId, inspectionId}= await params;
    return ( 
        <>
            <div className="fles-1 flex flex-col gap-y-8" >
                <Heading title="Analysis Tabular data" 
                description="All your Analysis information " 
                tabs={
                    <AnalysisTabs projectId={projectId} inspectionId={inspectionId} />
                }    
                />
            </div>
            <p>Analysis Table Page</p>
        </>
     );
}
 
export default AnalysisTablePage;