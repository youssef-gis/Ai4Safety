'use server';
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect"
import { prisma } from "@/lib/prisma";

export const getInspection = async (inspectionId: string) => {
    await getAuthOrRedirect();

    return await prisma.inspection.findUnique({
        where:{
            id:inspectionId,
        },
        include:{
            project:{
                select:{
                    name:true,
                    organizationId:true,
                }
            },
            conductedByUser:{
                select:{
                    email:true,
                    emailVerified:true,
                }
            }
        },
    });
}