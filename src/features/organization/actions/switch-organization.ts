'use server';
import { formErrorToActionState, toActionState } from "@/components/forms/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect"
import { prisma } from "@/lib/prisma";
import { organizationPath } from "@/path";
import { revalidatePath } from "next/cache";
import { getOrganizationsByUserId } from "../queries/get-organizations-by-user";

export const switchOrganization = async (organizationId:string) => {
    const {user}= await getAuthOrRedirect({
        checkActiveOrganization: false});
    try {
        const organizations = await getOrganizationsByUserId();
        const canSwitch= organizations.some((org)=>org.id===organizationId);

        if(!canSwitch){
            return toActionState('Error', 'Not a member of this organization');
        };

        await prisma.$transaction([
        
        prisma.membership.updateMany({
            where:{
                userId: user.id,
                organizationId:{
                    not: organizationId,
                },
            },
            data:{
                isActive:false
            },
        }),

        prisma.membership.update({
            where:{
                MembershipId:{
                    organizationId,
                    userId: user.id,
                },
            },
            data:{
                isActive: true,
            },
        })
        ]);

    } catch (error) {
        formErrorToActionState(error)
    };

    revalidatePath(organizationPath());
    return toActionState('Success', 'Active organization switched');
}