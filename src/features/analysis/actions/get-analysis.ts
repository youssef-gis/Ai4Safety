'use server';

import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-rerdirect';
import {prisma} from '@/lib/prisma'
import { AnalysisType } from '@prisma/client';


export const getAnalysis = async(inspectionId:string ) => {
    
    const {user,activeOrganization} = await getAuthOrRedirect();

    if (!user || !activeOrganization){
        return null;
    }

    const analysis= await prisma.analysis.findFirst({
        where: {
            inspectionId,
            // job:{
            //     type: AnalysisType.CRACK_DETECTION,
            // },

            inspection:{
                project:{
                    organizationId: activeOrganization.id,
                }
            }
        },
        include: {
            job:true,
            detections: {
                include:{
                    attachments: true
                }
            },
            inspection:{
                select:{
                    title:true,
                    project:{
                        select:{
                            name:true,
                            address: true
                        }
                    }
                }
            }
        }
    });

    if(!analysis){
        return null;
    };



    return {...analysis};
};