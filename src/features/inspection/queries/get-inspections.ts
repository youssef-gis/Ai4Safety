'use server';
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect"
import { prisma } from "@/lib/prisma";

export const getInspections = async (projectId: string) => {
    await getAuthOrRedirect();

    return await prisma.inspection.findMany({
        where:{
            projectId,
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