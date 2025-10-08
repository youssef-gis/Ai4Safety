'use server';
import { formErrorToActionState, toActionState } from "@/components/forms/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { IsOwner } from "@/features/auth/utils/is-owner";
import { prisma } from "@/lib/prisma";
import { projectsPath } from "@/path";
import { ProjectStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const UpdateProjectStatus = async (id: string, status: ProjectStatus) => {
    const {user}= await getAuthOrRedirect()
    try {
     
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