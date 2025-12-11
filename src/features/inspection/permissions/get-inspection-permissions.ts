import { getAdminOrRedirect } from "@/features/membership/queries/get-admin-or-redirect";
import { prisma } from "@/lib/prisma";
import { MembershipRole } from "@prisma/client";

type InspectionPermissionProps = {
    organizationId: string | undefined;
    userId: string | undefined;
}
export const getInspectionPermissions = async({
    organizationId,
    userId,
}: InspectionPermissionProps)  => {
    
    if( ! organizationId || !userId ){
        return {
            canDeleteInspection: false,
            canEditInspection: false
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
            canDeleteInspection: false,
            canEditInspection: false
        };
    };

    if(membership.membershipRole === MembershipRole.ADMIN){
            return {
                canDeleteInspection: true,
                canEditInspection: true
            };
        };

    
    return {
        canDeleteInspection: membership.canDeleteInspection,
        canEditInspection: membership.canEditInspection
    };
}