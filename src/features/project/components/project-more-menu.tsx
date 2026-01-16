"use client";
import {  ProjectStatus } from "@prisma/client";
import {  LucideTrash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React from "react";
//import { ProjectStatusLabels } from "@/features/constants";
import { PROJECT_STATUS_CONFIG } from "@/features/constants";
import { UpdateProjectStatus } from "../actions/update-project-status";
import { toast } from "sonner";
import { deleteProject } from "../actions/delete-project";
import { useConfirmDialog } from "@/components/confirm-dialogue";
import { ProjectWithMetadata } from "../types";

type ProjectMoreMenuProps = {
    project: ProjectWithMetadata;
    trigger: React.ReactNode;
}

const ProjectMoreMenu = ({project, trigger}: ProjectMoreMenuProps) => {
    const [deleteButton, deleteDialog] = useConfirmDialog({
        action: deleteProject.bind(null, project.id),
        trigger: (
            <DropdownMenuItem disabled={
                !project.permissions.canDeleteProject
            } >
                <LucideTrash className="h-4 w-4 mr-2" />
                <span>Delete</span>
            </DropdownMenuItem>
            ),
        });
        

    const handleProjectStatus = async (status: string)=>{
        //console.log('Status changed to:', status);
        const promise=  UpdateProjectStatus(project.id, status as ProjectStatus);

        toast.promise(promise, {
            loading:'Updating project status...',
        })

        const result= await promise;

        if(result.status === 'Success'){
            toast.success(result.message);

        } else if(result.status === 'Error'){
            toast.error(result.message);
        }
    }

    const projectStatusRadioGroup = (
        <DropdownMenuRadioGroup value={project.status} 
            onValueChange={handleProjectStatus} >
            {(Object.entries(PROJECT_STATUS_CONFIG) as [ProjectStatus, typeof PROJECT_STATUS_CONFIG[ProjectStatus]][]).map(
                ([key, config]) => {
                    const StatusIcon = config.icon; 
                    
                    return (
                    <DropdownMenuRadioItem 
                        key={key} 
                        value={key}
                        className="cursor-pointer"
                    >
                        <StatusIcon className={`mr-2 h-4 w-4 ${config.color}`} />
                        {config.label}
                    </DropdownMenuRadioItem>
                    );
                }
            )}
        </DropdownMenuRadioGroup>
    )

    return (
    <>
    {deleteDialog} 
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="right" align="start" >
        <DropdownMenuLabel>Project Menu</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {  projectStatusRadioGroup}
        <DropdownMenuSeparator />
        {  deleteButton}
      </DropdownMenuContent>
    </DropdownMenu>
    </>

     );
};

export { ProjectMoreMenu };
