'use server';

import { toActionState } from "@/components/forms/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { prisma } from "@/lib/prisma";
import { getInspections } from "../queries/get-inspections";
import { getInspection } from "../queries/get-inspection";


type deleteInspectionProps = {
    inspectionId:string; 
    conductedByUserId:string | null ;
}
export const deleteInspection = async({
    inspectionId, 
    conductedByUserId}:deleteInspectionProps) => {
    
    const {user}=await getAuthOrRedirect();
    
    //const inspections = await getInspections(projectId);
    
   // const isLastMembership = (memberships ?? []).length <= 1 ;

    // if(isLastMembership){
    //     return toActionState(
    //         'Error', 
    //         "You can't delete the last membership of an organization");
    // }

    const targetInspection =  await getInspection(inspectionId)
    console.log('Target Inspection : ', targetInspection)

    if(!targetInspection){
        return toActionState('Error', 'Inspection not found');
    }

    // const adminMembership = (inspections ?? []).filter(
    //     (m)=>m.conductedByUser.==='ADMIN');
    
    // const removesAdmin = targetMembership.membershipRole === 'ADMIN';
    
    // const isLastAdmin = adminMembership.length <= 1 ;

    // if(removesAdmin && isLastAdmin){
    //     return toActionState(
    //         "Error",
    //         "You can not delete the last admin of an aorganization"
    //     );
    // }

    // const myMembership = (memberships ?? []).find(
    //     (m)=>m.userId===user.id
    // );

    // const isMyself = user.id === userId;
    // const isAdmin = myMembership?.membershipRole === 'ADMIN';

    // if( !isMyself && !isAdmin ){
    //     return toActionState('Error', 'Only Admins can delete memberships');
    // }


    await prisma.inspection.delete({
        where:{
            id:targetInspection.id,
            conductedByUserId:targetInspection.conductedByUserId
        },
    });

    return toActionState('Success',  
        'Inspection has been deleted!');
}