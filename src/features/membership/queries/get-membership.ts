import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect"
import { prisma } from "@/lib/prisma";

export const getMembership = async ({
    organizationId, userId}:{
        organizationId:string, userId:string
    }) => {
    await getAuthOrRedirect();

    return await prisma.membership.findUnique({
        where:{
            MembershipId:{
                organizationId,
                userId
            }
        },
    });
}