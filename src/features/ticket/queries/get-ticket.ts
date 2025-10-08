import { getAuth } from '@/features/auth/queries/get-auth';
import { IsOwner } from '@/features/auth/utils/is-owner';
import {prisma} from '@/lib/prisma'
import { getTicketPermissions } from '../permissions/get-ticket-permissions';

export const getTicket = async(ticketId:string ) => {
    
    const {user} = await getAuth();

    const ticket= await prisma.ticket.findUnique({
        where: {
            id: ticketId,
        },
        include: {
            user :{
                select:{
                    username: true
                }
            }
        }
    });

    if(!ticket){
        return null;
    };

    const permissions = await getTicketPermissions({
        userId: user?.id, 
        organizationId: ticket.organizationId})

    return {...ticket, isOwner: IsOwner(user, ticket), permissions:{
        canDeleteTicket: IsOwner(user, ticket) && !!permissions.canDeleteTicket,
    }};
};