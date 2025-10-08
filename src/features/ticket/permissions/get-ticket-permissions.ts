import { getAdminOrRedirect } from "@/features/membership/queries/get-admin-or-redirect";
import { prisma } from "@/lib/prisma";

type TicketPermissionProps = {
    organizationId: string | undefined;
    userId: string | undefined;
}
export const getTicketPermissions = async({
    organizationId,
    userId,
}: TicketPermissionProps)  => {
    
    if( ! organizationId || !userId ){
        return {
            canDeleteTicket: false
        };
    }


    const membership = await prisma.membership.findUnique({
        where:{
            MembershipId:{
                userId,
                organizationId,
            }
        },
    });

    if(!membership){
        return {
            canDeleteTicket: false,
        };
    }

    
    return {
        canDeleteTicket: membership.canDeleteTicket,
    };
}