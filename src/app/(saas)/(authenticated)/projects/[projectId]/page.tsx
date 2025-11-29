
import { Breadcrumbs } from '@/components/breadcrumbs';
import Heading from '@/components/heading';
import { Separator } from '@/components/ui/separator';
import { Attachments } from '@/features/attachments/components/attachments';
import { Comments } from '@/features/comment/components/comments/comments';
import { getComments } from '@/features/comment/queries/get-comments';
import { ProjectItem } from '@/features/project/components/project-item';
import { getProject } from '@/features/project/queries/get-project';

import { notFound } from 'next/navigation';
import { ProjectBreadCrumbs } from './_navigation/tabs';

type ProjectPageProps= {
    params:{
        projectId: string,
    }
}


const  ProjectPage = async ({params}:ProjectPageProps) => {
  const { projectId } = await params;
  const projectPromise = getProject(projectId);
  const commentsPromise = getComments(projectId);


  const [project, paginatedComments] = await Promise.all([
    projectPromise,
    commentsPromise,
  ]);
    
    if(!project){
        return(
            notFound()
        )
    }
    return (
      <div className='flex-1 flex flex-col gap-y-8'>
         <Heading title='Project Dashboard' 
            description='Project State'
            tabs={< ProjectBreadCrumbs />}
             
          />
       

        <div className='flex justify-center' >
          <ProjectItem project={project} isDetail
          //   attachments={
          //     <Attachments entityId={ticket.id} 
          //       entity="TICKET" 
          //       isOwner={ticket.isOwner} />
          //   }
          //   referencedTickets = {<ReferencedTickets ticketId={ticket.id}/>} 
          //   comments={
          //   <Comments
          //     ticketId={ticket.id}
          //     paginatedComments={paginatedComments}
          //   />
          // }
          />
        </div>
       </div>
        
     );
}
 
export default ProjectPage;


    
   