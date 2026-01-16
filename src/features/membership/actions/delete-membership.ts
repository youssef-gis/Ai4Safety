'use server';

import { toActionState } from "@/components/forms/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { prisma } from "@/lib/prisma";
import { getMemberships } from "../queries/get-memberships";

type deleteMembershipProps = {
    organizationId:string; 
    userId:string;
}
export const deleteMembership = async({
    organizationId, 
    userId}:deleteMembershipProps) => {
    
    const {user}=await getAuthOrRedirect();
    
    const memberships = await getMemberships(organizationId);

    if (!Array.isArray(memberships)) {
        return memberships; 
        }

    
    const isLastMembership = (memberships ?? []).length <= 1 ;

    if(isLastMembership){
        return toActionState(
            'Error', 
            "You can't delete the last membership of an organization");
    }

    const targetMembership = (memberships ?? []).find(
            (m)=>m.userId===userId)

    if(!targetMembership){
        return toActionState('Error', 'Membership not found');
    }

    const adminMembership = (memberships ?? []).filter(
        (m)=>m.membershipRole==='ADMIN');
    
    const removesAdmin = targetMembership.membershipRole === 'ADMIN';
    
    const isLastAdmin = adminMembership.length <= 1 ;

    if(removesAdmin && isLastAdmin){
        return toActionState(
            "Error",
            "You can not delete the last admin of an aorganization"
        );
    }

    const myMembership = (memberships ?? []).find(
        (m)=>m.userId===user.id
    );

    const isMyself = user.id === userId;
    const isAdmin = myMembership?.membershipRole === 'ADMIN';

    if( !isMyself && !isAdmin ){
        return toActionState('Error', 'Only Admins can delete memberships');
    }


    await prisma.membership.delete({
        where:{
            MembershipId:{
                userId,
                organizationId,
            },
        },
    });

    return toActionState('Success', 
        isMyself ? 
        'You have left the organization':
        'Membership has been deleted!');
}