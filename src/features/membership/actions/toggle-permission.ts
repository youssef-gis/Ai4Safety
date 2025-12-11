'use server';
import { prisma } from "@/lib/prisma";
import { getAdminOrRedirect } from "../queries/get-admin-or-redirect";
import { toActionState } from "@/components/forms/utils/to-action-state";
import { revalidatePath } from "next/cache";
import { membershipsPath } from "@/path";
import { Membership } from "@prisma/client";

type PermissionKey = keyof Pick<Membership, 
  'canDeleteInspection' | 
  'canEditInspection' |
  'canDeleteDefect' |
  'canEditDefect'
>;

export const togglePermission = async ({userId,
            organizationId,
            permissionKey}:{
                userId: string,
                organizationId: string,
                permissionKey: PermissionKey
            }) => {
    await getAdminOrRedirect(organizationId);

    // 2. Validate Key (Security precaution)
    const allowedKeys: PermissionKey[] = [
        'canDeleteInspection', 'canEditInspection',
        'canDeleteDefect' , 'canEditDefect'
    ];

    if (!allowedKeys.includes(permissionKey as PermissionKey)) {
        return toActionState('Error', "Invalid permission key");
    }

    const key = permissionKey as PermissionKey;

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