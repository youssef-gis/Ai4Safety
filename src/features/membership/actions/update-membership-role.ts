"use server";

import { MembershipRole } from "@prisma/client";
import { getAdminOrRedirect } from "../queries/get-admin-or-redirect";

import { getMemberships } from "../queries/get-memberships";
import { toActionState } from "@/components/forms/utils/to-action-state";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { membershipsPath } from "@/path";

type UpdateMembershipRoleP= {
    organizationId: string,
    userId: string,
    membershipRole: MembershipRole
};

export const updateMembershipRole =async  ({
    organizationId,
    userId,
    membershipRole}: UpdateMembershipRoleP) => {
        await getAdminOrRedirect(organizationId);
        
        const memberships = await getMemberships(organizationId);
        if (!Array.isArray(memberships)) {
            return memberships; 
        }

        const targetMembership = (memberships ?? []).find(
            (membership)=>membership.userId === userId
        );

        if(!targetMembership){
            return toActionState('Error', 'Membership not found');
        }

        const adminMemberships = (memberships ?? []).filter(
            (m)=>m.membershipRole === 'ADMIN'
        );

        const removesAdmin = targetMembership.membershipRole === "ADMIN";
        const isLastAdmin = adminMemberships.length <= 1;

        if(removesAdmin && isLastAdmin){
            return toActionState('Error', 
                'Can not change the last admin');
        }

        await prisma.membership.update({
            where:{
                MembershipId:{
                    organizationId,
                    userId,
                },
            },
            data:{
                membershipRole
            },
        });

        revalidatePath(membershipsPath(organizationId));

        return toActionState('Success', 'Membership role Updated');


}