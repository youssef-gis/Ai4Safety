'use server';
import { formErrorToActionState, toActionState } from "@/components/forms/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { IsOwner } from "@/features/auth/utils/is-owner";
import { prisma } from "@/lib/prisma";
import { projectsPath } from "@/path";
import { ProjectStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getProjectPermissions } from "../permissions/get-project-permissions";

export const UpdateProjectStatus = async (id: string, status: ProjectStatus) => {
    const {user, activeOrganization}= await getAuthOrRedirect();
    if (!user || !activeOrganization) {
        return toActionState('Error', 'Not Authenticated');
    }
    
    try {
        const permissions = await getProjectPermissions({
            userId: user.id,
            organizationId: activeOrganization.id
        });
            
        if(!permissions.canEditProject){
            return toActionState('Error', 'Not authorized');
        };
     
        const project= await prisma.project.findUnique({
            where:{
                id,
            },
        });
        if(!project || !IsOwner(user, project)){
            return toActionState('Error', 'Not Authorized');
        }

        await prisma.project.update({
            where: { id,},
            data: {status,},
        });        
    } catch (error) {
        return formErrorToActionState(error);
    };

    revalidatePath(projectsPath());

    return toActionState("Success", "Project status updated!");

};