"use server";
import { setCookieByKey } from "@/actions/cookies";
import { formErrorToActionState, toActionState } from "@/components/forms/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { IsOwner } from "@/features/auth/utils/is-owner";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTicketPermissions } from "../permissions/get-ticket-permissions";

const deleteTicket = async (ticketId: string) => {
    
    const {user}= await getAuthOrRedirect()

    try {
        const ticket= await prisma.ticket.findUnique({
            where:{
                id: ticketId,
            },
        });

        if(!ticket || !IsOwner(user, ticket)){
            return toActionState('Error', 'Not authorized');
        }

        const permissions = await getTicketPermissions({
            userId: ticket.userId,
            organizationId: ticket.organizationId
        });

        if(!permissions.canDeleteTicket){
            return toActionState('Error', 'Not authorized');
        }


        await prisma.ticket.delete({
        where:{
            id: ticketId,
        },
    });

    } catch (error) {
        return formErrorToActionState(error)
    }

   
    revalidatePath(ticketsPath()); 
    await setCookieByKey('toast', "Ticket deleted!");
    //console.log(getCookieByKey('toast'));
    redirect(ticketsPath());
};

export {deleteTicket}