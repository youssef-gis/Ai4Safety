import { Breadcrumbs } from "@/components/breadcrumbs";
import { CardElement } from "@/components/card-compact";
import { Separator } from "@/components/ui/separator";
import { ProjectUpsertForm } from "@/features/project/components/project-form-upsert";
import { getProject } from "@/features/project/queries/get-project";

import { projectPath, projectsPath } from "@/path";

import { notFound } from "next/navigation";


type ProjectEditProps = {
  params: Promise<{
    projectId: string;
  }>;
};


const ProjectEditPage = async ({params}:ProjectEditProps) => {
    const { projectId } =  await params;
    const project = await getProject(projectId);


    const isProjectFound= !!project;

    if (!project || typeof project === 'object' && 'serverError' in project || !('isOwner' in project) || !project.isOwner) {
        notFound();
    }

   
    return ( 
        <div className='flex-1 flex flex-col gap-y-8'>
        <Breadcrumbs breadcrumbs={[
            {title: 'Projects', href:projectsPath()},
            {title:project.name, href:projectPath(project.id)},
            {title:'Edit'},
        ]}/>
        <Separator />
        
        <div className="flex-1 flex flex-col
         justify-center items-center" >
            <CardElement title="Edit Project" 
            description="Edit an existing Project"
            className="w-full max-w-[420px]"
            content={<ProjectUpsertForm project={project} />}  />
        </div>    
        </div>
     );
}
 
export default ProjectEditPage;