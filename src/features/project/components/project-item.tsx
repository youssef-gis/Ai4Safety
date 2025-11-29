
import {clsx} from 'clsx';
import { projectEditPath, projectPath } from '@/path';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";


import Link from 'next/link';

import { LucideMoreVertical, LucidePencil, LucideSquareArrowOutUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectsIcn } from '@/features/constants';
import { ProjectMoreMenu } from './project-more-menu';
import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectWithMetadata } from '../types';
import { format } from 'date-fns';


type ProjectItemProps={
    project: ProjectWithMetadata;
    isDetail ?:boolean;
    attachments?: React.ReactNode;
    referencedInspections?: React.ReactNode;
    comments?:React.ReactNode;
}

export  const ProjectItem =  ({project, isDetail, 
    attachments, referencedInspections,comments} : ProjectItemProps) => {

    //project.isOwner ? : null
    const detailButton=  (
                <Button asChild variant='outline' size='icon' >
            <Link prefetch
                href={projectPath(project.id)} 
                 >
                <LucideSquareArrowOutUpRight  className='h-4 w-4'/>
            </Link>
        </Button> 
    );

    const editButton= project.isOwner ? (
        <Button variant="outline" size='icon' asChild>
            <Link  href={projectEditPath(project.id)} >
                <LucidePencil className='w-4 h-4' />
            </Link>
        </Button>
    ): null ;

    const moreMenu=  project.isOwner ? ( <ProjectMoreMenu project={project} trigger={ 
            <Button variant='outline' size='icon'>
                <LucideMoreVertical className="h-4 w-4" />
            </Button>} >
            </ProjectMoreMenu> ) : null; 

 

    return ( 
    <div  className={clsx('w-full flex flex-col gap-y-4', {
            'max-w-[580px]': isDetail,
            'max-w-[420px]': !isDetail,
        })}>
        <div className='flex gap-x-2' >
            <Card className='w-full  max-w-[420px]'>
                <CardHeader>
                    <CardTitle className=' flex gap-x-2 truncate' >
                    <span>{ProjectsIcn[project.status]}</span>
                    <span>{project.name}</span> 
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <span className={clsx("whitespace-break-spaces",{
                        "line-clamp-3": !isDetail,
                    })}>
                        {project.description}
                    </span>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <p className="text-sm text-muted-foreground">
                    {format(project.updatedAt, 'yyyy-MM-dd')} by {project.user?.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    {project.address }
                    </p>
                </CardFooter>
            </Card>
        <div className='flex flex-col gap-y-1' >
                { isDetail ? (<> {editButton} {moreMenu}</>) : 
                            (<>{detailButton} {moreMenu} </>)}
        </div>
        </div>
        {isDetail ? 
         (<Suspense fallback={
         <div className='flex flex-col gap-y-4' >
            <Skeleton className='h-[250px] w-full' />
            <Skeleton className='h-[80px] ml-8' />
            <Skeleton className='h-[80px] ml-8' />
         </div>} >
            {attachments}
            {referencedInspections}
            {comments}
          </Suspense>): null}
    </div>
     );
}
 