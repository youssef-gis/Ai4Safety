'use server';
import {  setCookieByKey } from '@/actions/cookies';
import {formErrorToActionState, ActionState, toActionState} from '@/components/forms/utils/to-action-state';
import {prisma} from '@/lib/prisma';
import { three_D_viewer_Path, ticketPath, ticketsPath } from '@/path';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {toCent} from "@/utils/currency"
import {z} from 'zod';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-rerdirect';
import { IsOwner } from '@/features/auth/utils/is-owner';
import { DetectionType, DetectionSeverity, DetectionStatus } from '@prisma/client';
import { getAnalysis } from '@/features/analysis/actions/get-analysis';


const LocationCoordinatesSchema = z.object({ x: z.number(), y: z.number(), z: z.number() });
const LocationSchema = z.object({
    type: z.enum(['polyline', 'polygon']),
    coordinates: z.array(LocationCoordinatesSchema),
    measurement: z.string().optional(),
    labelPosition: LocationCoordinatesSchema.optional(),
});

const UpsertDetectionSchema= z.object({
    Defect_Type: z.enum(DetectionType),
    Defect_Severity: z.enum(DetectionSeverity),
    Defect_Status: z.enum(DetectionStatus),
    Defect_Notes: z.string().max(1024).optional(),
    Defect_Location: z.preprocess(
        (val) => (typeof val === 'string' && val) ? JSON.parse(val) : undefined,
        LocationSchema.optional()
    )
});


const UpsertDetection = async (id: string | undefined,
    inspectionId: string,
    _actionStat:ActionState,
    formData: FormData) =>{
    const {user, activeOrganization}= await getAuthOrRedirect();

    const analysis= await getAnalysis(inspectionId);

    console.log("Analysis of the inspection: ",inspectionId, analysis)
    
    if(!analysis){
        return toActionState('Error', 'Analysis not found or not authorized.');
    };

    try{
        if(!user || !activeOrganization){
            return toActionState('Error', 'Not Authenticated')
        }
        if(id){
            const detection = await prisma.detection.findFirst({
                 where: {
                     id,
                     analysis: {
                         inspection: {
                             project: {
                                 organizationId: activeOrganization.id
                             }
                         }
                     }
                 }
                 
             });

            if(!detection){
                return toActionState('Error', 'Not authorized to edit this defect.');
            }
        }
        const data= UpsertDetectionSchema.parse({
            Defect_Type: formData.get('Defect_Type') ,
            Defect_Severity: formData.get('Defect_Severity') ,
            Defect_Status: formData.get("Defect_Status") ,
            Defect_Notes: formData.get("Defect_Notes") || undefined,
            Defect_Location: formData.get("Defect_Location") || undefined,
        });

        const dbdata= {
            type: data.Defect_Type,
            severity: data.Defect_Severity,
            status: data.Defect_Status,
            notes: data.Defect_Notes,
            locationOn3dModel: data.Defect_Location
        }

        await prisma.detection.upsert({
            where:{
                id: id || ""
            },
            update: dbdata,
            create: {...dbdata, analysisId: analysis.id,},

        });
    }catch (error){
        return formErrorToActionState(error, formData);
    }


    //revalidatePath(three_D_viewer_Path(projectId, inspectionId));

    if (id){
        await setCookieByKey("toast", "Defect Updated!")
        //redirect(ticketPath(id));
    }
  
    return toActionState('Success', id ? 'Defect Updated' : 'Defect Created')
};

export {UpsertDetection};