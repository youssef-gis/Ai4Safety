import { getAdminOrRedirect } from "@/features/membership/queries/get-admin-or-redirect";
import { prisma } from "@/lib/prisma";
import { MembershipRole } from "@prisma/client";

type DefectPermissionProps = {
    organizationId: string | undefined;
    userId: string | undefined;
}
export const getDefectPermissions = async({
    organizationId,
    userId,
}: DefectPermissionProps)  => {
    
    if( ! organizationId || !userId ){
        return {
            canDeleteDefect: false,
            canEditDefect: false
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
            canDeleteDefect: false,
            canEditDefect: false
        };
    };

    if(membership.membershipRole === MembershipRole.ADMIN){
        return {
            canDeleteDefect: true,
            canEditDefect: true
        };
    };
    

    
    return {
        canDeleteDefect: !!membership.canDeleteDefect,
        canEditDefect: !!membership.canEditDefect
    };
}