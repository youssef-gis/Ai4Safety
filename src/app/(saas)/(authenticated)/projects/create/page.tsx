import { CardElement } from "@/components/card-compact";
import { ProjectUpsertForm } from "@/features/project/components/project-form-upsert";

const ProjectCreatePage = () => {
    return ( 
        <div className="flex-1 flex  flex-col justify-center items-center">
            <CardElement
                title="Create Project"
                description="Create your project to get your inspection results"
                className="w-full max-w-[420px]"
                content={<ProjectUpsertForm />}
            />
        </div>
     );
}
 
export default ProjectCreatePage;