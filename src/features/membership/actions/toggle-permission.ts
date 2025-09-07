'use server';
import { prisma } from "@/lib/prisma";
import { getAdminOrRedirect } from "../queries/get-admin-or-redirect";
import { toActionState } from "@/components/forms/utils/to-action-state";
import { revalidatePath } from "next/cache";
import { membershipsPath } from "@/path";

type PermissionKey='canDeleteTicket';

export const togglePermission = async ({userId,
            organizationId,
            permissionKey}:{
                userId: string,
                organizationId: string,
                permissionKey: PermissionKey
            }) => {
    await getAdminOrRedirect(organizationId);

    const where = {
        MembershipId:{
            organizationId,
            userId,
        },
    };

    const membership = await prisma.membership.findUnique({
        where,
    });

    if(!membership){
        return toActionState('Error', "Membership not Found");
    }

    await prisma.membership.update({
        where,
        data:{
            [permissionKey]: membership[permissionKey] === true ? false : true,
        },
    });

    revalidatePath(membershipsPath(organizationId));

    return toActionState('Success', 'Permission updated');

}