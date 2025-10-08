import Heading from "@/components/heading";
import { CardElement } from "@/components/card-compact";
import { InspectionUpsertForm } from "@/features/inspection/components/inspection-form-upsert"

type InspectionCreatePageProp = {
    params: Promise<{projectId: string}>;
};

const InspectionCreatePage = async({params}:InspectionCreatePageProp) => {
    const {projectId}= await params;
    return ( 
        <>
        <Heading 
                title="Inspections"
                description="Create your inspection"
            
        />  
        <div className="flex-1 flex  flex-col justify-center items-center">
            <CardElement
                title="Start your Inspection"
                description="Start your Inspection to monitor your building health"
                className="w-full max-w-[420px]"
                content={<InspectionUpsertForm projectId={projectId} />}
            />
        </div>
        </>
     );
}
 
export default InspectionCreatePage;