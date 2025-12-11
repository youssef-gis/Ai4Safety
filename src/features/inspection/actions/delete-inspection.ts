'use server';

import { toActionState } from "@/components/forms/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { prisma } from "@/lib/prisma";
import { getInspections } from "../queries/get-inspections";
import { getInspection } from "../queries/get-inspection";
import { getInspectionPermissions } from "../permissions/get-inspection-permissions";


type deleteInspectionProps = {
    inspectionId:string; 
    conductedByUserId:string | null ;
}
export const deleteInspection = async({
    inspectionId, 
    conductedByUserId}:deleteInspectionProps) => {
    
    const {user, activeOrganization}=await getAuthOrRedirect();
    
    if (!user || !activeOrganization) {
        return toActionState('Error', 'Not Authenticated');
        }
    
    const permissions = await getInspectionPermissions({
                userId: user.id,
                organizationId: activeOrganization.id
        });
    
    if (!permissions.canDeleteInspection) {
        return toActionState('Error', 'You do not have permission to delete defects.');
        }

    const targetInspection =  await getInspection(inspectionId)
    console.log('Target Inspection : ', targetInspection)

    if(!targetInspection){
        return toActionState('Error', 'Inspection not found');
    }

    await prisma.inspection.delete({
        where:{
            id:targetInspection.id,
            conductedByUserId:targetInspection.conductedByUserId
        },
    });

    return toActionState('Success',  
        'Inspection has been deleted!');
}