'use server';
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { prisma } from "@/lib/prisma";

export const getDefects = async (inspectionId: string) => {
    const { activeOrganization } = await getAuthOrRedirect();

    if (!activeOrganization) {
        return [];
    }

    return await prisma.detection.findMany({
        where: {
            // Filter by the specific inspection
            analysis: {
                inspectionId: inspectionId,
                //This inspection belongs to the user's active organization
                inspection: {
                    project: {
                        organizationId: activeOrganization.id
                    }
                }
            }
        },
        // include: {
        //     // Include related analysis info if needed
        //     analysis: {
        //         select: {
        //             id: true,
        //             createdAt: true
        //         }
        //     },
        //     // Include images (DetectionOnImage) if you want to show thumbnails
        //     images: {
        //         select: {
        //             supplement: {
        //                 select: {
        //                     url: true,
        //                     name: true
        //                 }
        //             }
        //         }
        //     }
        // },
        orderBy: {
            createdAt: 'desc'
        }
    });
};