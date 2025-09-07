'use server';
import { formErrorToActionState, toActionState } from "@/components/forms/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { IsOwner } from "@/features/auth/utils/is-owner";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/path";
import { TicketStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const UpdateTicketStatus = async (id: string, status: TicketStatus) => {
    const {user}= await getAuthOrRedirect()
    try {
     
        const ticket= await prisma.ticket.findUnique({
            where:{
                id,
            },
        });
        if(!ticket || !IsOwner(user, ticket)){
            return toActionState('Error', 'Not Authorized');
        }

        await prisma.ticket.update({
            where: { id,},
            data: {status,},
        });        
    } catch (error) {
        return formErrorToActionState(error);
    };

    revalidatePath(ticketsPath());

    return toActionState("Success", "Ticket status updated!");

};