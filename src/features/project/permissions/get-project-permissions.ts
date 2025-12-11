import { prisma } from "@/lib/prisma";
import { MembershipRole } from "@prisma/client";

type ProjectPermissionProps = {
    userId: string | undefined;
    organizationId: string | undefined;
}
export const getProjectPermissions = async({
    userId,
    organizationId
}: ProjectPermissionProps)  => {
    if(!userId || ! organizationId){
        return {
            canDeleteProject: false,
            canEditProject: false
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
            canDeleteProject: false,
            canEditProject: false
        };
    };

    if(membership.membershipRole === MembershipRole.ADMIN){
            return {
                canDeleteProject: true,
                canEditProject: true
            };
        };

    return {
        canDeleteProject: membership.canDeleteProject,
        canEditProject: membership.canEditProject
    };
}