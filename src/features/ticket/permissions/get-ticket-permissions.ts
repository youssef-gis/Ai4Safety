import { prisma } from "@/lib/prisma";

type TicketPermissionProps = {
    userId: string | undefined;
    organizationId: string | undefined;
}
export const getTicketPermissions = async({
    userId,
    organizationId
}: TicketPermissionProps)  => {
    if(!userId || ! organizationId){
        return {
            canDeleteTicket: false
        };
    }

    const membership = await prisma.membership.findUnique({
        where:{
            MembershipId:{
            organizationId,
            userId,
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