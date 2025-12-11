'use server';
import { toActionState } from "@/components/forms/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect"
import { prisma } from "@/lib/prisma";

export const getMemberships = async (organizationId: string) => {
    const {user, activeOrganization}= await getAuthOrRedirect();

    if (!user || !activeOrganization) {
        return toActionState('Error', 'Not Authenticated');
        }
    
    return await prisma.membership.findMany({
        where:{
            organizationId,
        },
        include:{
            user:{
                select:{
                    username:true,
                    email:true,
                    emailVerified:true
                }
            },
        },
    });
}