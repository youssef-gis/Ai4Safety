'use server';
import { formErrorToActionState, toActionState } from "@/components/forms/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { IsOwner } from "@/features/auth/utils/is-owner";
import * as ticketService from "@/features/ticket/service";
import { prisma } from "@/lib/prisma"
import { ticketPath } from "@/path";
import { revalidatePath } from "next/cache";

export const deleteComment = async (id : string) => {
    
    const {user}= await getAuthOrRedirect();

    const comment = await prisma.comment.findUnique({
        where:{
            id,
        },
    });
    
    if(!comment || !IsOwner(user, comment) ){
        return toActionState('Error', 'Not Authorized');
    }

    try {
    await prisma.comment.delete({
        where:{
            id,
        },
    }); 

    await ticketService.disconnectReferencedTicketsViaComment(comment)

    } catch (error) {
        formErrorToActionState(error)
    }
    


    revalidatePath(ticketPath(comment.ticketId));
    
    return toActionState('Success', 'Comment Deleted!');
};