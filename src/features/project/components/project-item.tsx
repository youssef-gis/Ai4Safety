"use client";

import { clsx } from 'clsx';
import { projectEditPath, projectPath } from '@/path';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import Link from 'next/link';

import { 
  LucideMoreVertical, 
  LucidePencil, 
  LucideSquareArrowOutUpRight,
  Calendar, 
  User,     
  MapPin    
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import { PROJECT_STATUS_CONFIG } from '@/features/constants'; 
import { ProjectMoreMenu } from './project-more-menu';
import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectWithMetadata } from '../types';
import { format } from 'date-fns';

type ProjectItemProps = {
  project: ProjectWithMetadata;
  isDetail?: boolean;
  attachments?: React.ReactNode;
  referencedInspections?: React.ReactNode;
  comments?: React.ReactNode;
  canEdit: boolean;
  canDelete: boolean;
}

export const ProjectItem = ({ 
  project, 
  isDetail, 
  attachments, 
  referencedInspections, 
  comments 
}: ProjectItemProps) => {

  // 1. GET STATUS CONFIG
  const statusConfig = PROJECT_STATUS_CONFIG[project.status];
  const StatusIcon = statusConfig.icon;

  const detailButton = (
    <Button asChild variant='outline' size='icon' className="h-8 w-8">
      <Link prefetch href={projectPath(project.id)}>
        <LucideSquareArrowOutUpRight className='h-4 w-4 text-muted-foreground' />
      </Link>
    </Button>
  );

  const editButton = project.isOwner ? (
    <Button variant="outline" size='icon' className="h-8 w-8" asChild>
      <Link href={projectEditPath(project.id)}>
        <LucidePencil className='w-4 h-4 text-muted-foreground' />
      </Link>
    </Button>
  ) : null;

  const moreMenu = project.isOwner ? (
    <ProjectMoreMenu 
      project={project} 
      trigger={
        <Button variant='outline' size='icon' className="h-8 w-8">
          <LucideMoreVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
      } 
    />
  ) : null;

  return (
    <div className={clsx('w-full flex flex-col gap-y-4 transition-all', {
      'max-w-[800px]': isDetail, // Widen detail view slightly
      'max-w-[420px]': !isDetail,
    })}>
      
      <div className='flex gap-x-2 items-start'>
        <Card className='w-full flex-1 hover:shadow-md transition-shadow duration-200 border-muted/60'>
          
          <CardHeader className="pb-3">
            <CardTitle className='flex items-center gap-x-3 text-base font-semibold'>
              {/* 2. DYNAMIC STATUS ICON */}
              <div className={clsx("p-2 rounded-full bg-opacity-10", statusConfig.bg)}>
                 <StatusIcon className={clsx("w-5 h-5", statusConfig.color)} />
              </div>
              
              <span className="truncate">{project.name}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="pb-3">
            <p className={clsx("text-sm text-muted-foreground whitespace-break-spaces leading-relaxed", {
              "line-clamp-2": !isDetail,
            })}>
              {project.description}
            </p>
          </CardContent>

          {/* 3. POLISHED METADATA FOOTER */}
          <CardFooter className="flex flex-col gap-y-2 pt-0 items-start">
            <div className="flex items-center gap-x-4 text-xs text-muted-foreground w-full">
              
              {/* Date & User Group */}
              <div className="flex items-center gap-x-1 shrink-0">
                 <Calendar className="w-3.5 h-3.5" />
                 <span>{format(new Date(project.updatedAt), 'MMM dd, yyyy')}</span>
              </div>
              
              <div className="flex items-center gap-x-1 shrink-0">
                 <User className="w-3.5 h-3.5" />
                 <span className="max-w-[100px] truncate">{project.user?.username || 'Unknown'}</span>
              </div>

            </div>

            {/* Address Line */}
            {project.address && (
               <div className="flex items-start gap-x-1 text-xs text-muted-foreground w-full">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span className="truncate">{project.address}</span>
               </div>
            )}
          </CardFooter>
        </Card>

        {/* Action Buttons Column */}
        <div className='flex flex-col gap-y-2 shrink-0'>
          {isDetail ? (
            <> {editButton} {moreMenu} </>
          ) : (
            <> {detailButton} {moreMenu} </>
          )}
        </div>
      </div>

      {isDetail ? (
        <Suspense fallback={
          <div className='flex flex-col gap-y-4'>
            <Skeleton className='h-[250px] w-full rounded-lg' />
            <div className="flex gap-4">
               <Skeleton className='h-20 w-1/2 rounded-lg' />
               <Skeleton className='h-20 w-1/2 rounded-lg' />
            </div>
          </div>
        }>
          {attachments}
          {referencedInspections}
          {comments}
        </Suspense>
      ) : null}
    </div>
  );
}