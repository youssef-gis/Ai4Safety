import { prisma } from "@/lib/prisma";

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
            canDeleteProject: false
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
        };
    }

    return {
        canDeleteProject: membership.canDeleteProject,
    };
}