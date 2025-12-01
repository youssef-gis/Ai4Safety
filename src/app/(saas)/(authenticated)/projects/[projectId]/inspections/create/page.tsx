import Heading from "@/components/heading";
import { CardElement } from "@/components/card-compact";
import { InspectionUpsertForm } from "@/features/inspection/components/inspection-form-upsert"
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { getProject } from "@/features/project/queries/get-project";
import { notFound } from "next/navigation";
import { ProjectBreadCrumbs } from "../../_navigation/tabs";

type InspectionCreatePageProp = {
    params: Promise<{projectId: string}>;
};

const InspectionCreatePage = async({params}:InspectionCreatePageProp) => {
    await getAuthOrRedirect();
    const {projectId}= await params;
    const project = await getProject(projectId);
    if (!project) return notFound();
    return ( 
        <div className="flex flex-col gap-y-8 max-w-5xl mx-auto w-full">
            <Heading 
                title="New Flight Import" 
                description={`Upload drone imagery for ${project.name} to generate 3D models and detect defects.`}
                tabs={
                    <ProjectBreadCrumbs 
                        projectName={project.name} 
                        inspectionTitle="New Import" 
                    />
                }
            /> 

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Updated Sidebar Context */}
                <div className="hidden lg:block space-y-4">
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            Before you upload
                        </h4>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-2 list-disc pl-4">
                            <li>Ensure images were taken with **80% overlap**.</li>
                            <li>Upload only **JPG/JPEG** formats.</li>
                            <li>Remove blurry or overexposed images to improve AI accuracy.</li>
                        </ul>
                    </div>
                </div>

                {/* Main Form Area */}
                <div className="lg:col-span-2">
                    <CardElement
                        title="Flight Data"
                        description="Configure the AI pipeline for this dataset."
                        className="w-full"
                        content={<InspectionUpsertForm projectId={projectId} />}
                    />
                </div>
            </div>
        </div>
     );
}
 
export default InspectionCreatePage;