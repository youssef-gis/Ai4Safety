"use server";

import { setCookieByKey } from "@/actions/cookies";
import { ActionState, formErrorToActionState, toActionState } from "@/components/forms/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { IsOwner } from "@/features/auth/utils/is-owner";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDefectPermissions } from "../permissions/get-defect-permissions";

const deleteDefect = async (defectId: string)  => {
    
    const { user, activeOrganization } = await getAuthOrRedirect();

    try {
        if (!user || !activeOrganization) {
            return toActionState('Error', 'Not Authenticated');
        }

        const permissions = await getDefectPermissions({
            userId: user.id,
            organizationId: activeOrganization.id
        });

        if (!permissions.canDeleteDefect) {
            return toActionState('Error', 'You do not have permission to delete defects.');
        }
        
        //Find the defect and verify it belongs to the user's org.
        const detection = await prisma.detection.findFirst({
            where: {
                id: defectId,
                analysis: {
                    inspection: {
                        project: {
                            organizationId: activeOrganization.id
                        }
                    }
                }
            }
        });

        if (!detection) {
            return toActionState('Error', 'Defect not found or you are not authorized.');
        }

        // Delete the defect
        await prisma.detection.delete({
            where: { id: defectId }
        });

       

    } catch (error) {
        return toActionState('Error', 'An unexpected error occurred.');
    }


    //await setCookieByKey('toast', "Defect deleted!");
    return toActionState('Success', 'Defect deleted!');

};

export {deleteDefect}