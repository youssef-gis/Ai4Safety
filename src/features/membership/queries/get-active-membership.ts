'use server';

import { getAuth } from "@/features/auth/queries/get-auth";
import { getActiveOrganization } from "@/features/organization/queries/get-active-organization";
import { prisma } from "@/lib/prisma";


export const getActiveMembership = async () => {
    
    const {user} = await getAuth();
    const activeOrganization = await getActiveOrganization();

    if(!user){
        return null;
    }

    const activeMembership = await prisma.membership.findFirst({
        where:{
            userId: user.id,
            organizationId: activeOrganization?.id,
            isActive: true
        },
    });

    
    return activeMembership ;
}