"use server";
import { setCookieByKey } from "@/actions/cookies";
import { formErrorToActionState, toActionState } from "@/components/forms/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { IsOwner } from "@/features/auth/utils/is-owner";
import { prisma } from "@/lib/prisma";
import { projectsPath } from "@/path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProjectPermissions } from "../permissions/get-project-permissions";

const deleteProject = async (projectId: string) => {
    
    const {user}= await getAuthOrRedirect()

    try {
        const project= await prisma.project.findUnique({
            where:{
                id: projectId,
            },
        });

        if(!project || !IsOwner(user, project)){
            return toActionState('Error', 'Not authorized');
        }

        const permissions = await getProjectPermissions({
            userId: project.userId,
            organizationId: project.organizationId
        });

        if(!permissions.canDeleteProject){
            return toActionState('Error', 'Not authorized');
        }


        await prisma.project.delete({
        where:{
            id: projectId,
        },
    });

    } catch (error) {
        return formErrorToActionState(error)
    }

   
    revalidatePath(projectsPath()); 
    await setCookieByKey('toast', "Project deleted!");
    //console.log(getCookieByKey('toast'));
    redirect(projectsPath());
};

export {deleteProject}