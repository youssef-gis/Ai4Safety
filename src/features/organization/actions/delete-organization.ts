'use server';
import { formErrorToActionState, toActionState } from "@/components/forms/utils/to-action-state";
import { prisma } from "@/lib/prisma";
import { getOrganizationsByUserId } from "../queries/get-organizations-by-user";
import { getAdminOrRedirect } from "@/features/membership/queries/get-admin-or-redirect";

export const deleteOrganization = async (organizationId:string) => {
    await getAdminOrRedirect(organizationId);
    try {
        const organizations = await getOrganizationsByUserId();
        const canDelete= organizations.some((org)=>org.id===organizationId);

        if(!canDelete){
            return toActionState('Error', 'Not a member of this organization');
        };

        await prisma.organization.delete({
            where:{
                id: organizationId,
            },
        });

    } catch (error) {
        formErrorToActionState(error)
    };

    return toActionState('Success', 'Organization deleted');
}