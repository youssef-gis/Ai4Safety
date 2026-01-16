'use server';
import {  setCookieByKey } from '@/actions/cookies';
import {formErrorToActionState, ActionState, toActionState} from '@/components/forms/utils/to-action-state';
import {prisma} from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {toCent} from "@/utils/currency"
import {z} from 'zod';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-rerdirect';
import { IsOwner } from '@/features/auth/utils/is-owner';
import * as attachmentData from "@/features/supplements/data";
import { DetectionType, DetectionSeverity, DetectionStatus } from '@prisma/client';
import { getAnalysis } from '@/features/analysis/actions/get-analysis';
import { getDefectPermissions } from '../permissions/get-defect-permissions';


const LocationCoordinatesSchema = z.object({ x: z.number(), y: z.number(), z: z.number() });

const Point2DSchema = z.object({ x: z.number(), y: z.number() });
const LocationSchema = z.object({
    type: z.enum(['polyline', 'polygon', 'point']),
    coordinates: z.array(LocationCoordinatesSchema),
    measurement: z.string().optional(),
    labelPosition: LocationCoordinatesSchema.optional(),

    annotation2D: z.array(Point2DSchema).optional(),
    sourceImageId: z.string().optional().nullable(),
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


const UpsertDetection = async (id: string ,
    projectId: string,
    inspectionId: string,
    filesKeys: string[],
    _actionStat:ActionState,
    formData: FormData) =>{
    const {user, activeOrganization}= await getAuthOrRedirect();

    if(!user || !activeOrganization){
            return toActionState('Error', 'Not Authenticated')
        }

    const analysis= await getAnalysis(inspectionId);
    
    if(!analysis){
        return toActionState('Error', 'Analysis not found or not authorized.');
    };

    try{ 
        const permissions = await getDefectPermissions({
                userId: user.id,
                organizationId: activeOrganization.id
        });
    
     
        const existingDefect = await prisma.detection.findUnique({ where: { id } });

        if (existingDefect) {
            if (!permissions.canEditDefect) {
                return toActionState('Error', 'You do not have permission to edit defects.');
            }
        } else {
           
            if (!permissions.canEditDefect) {
                return toActionState('Error', 'You do not have permission to create defects.');
            }
        }
        
        const data= UpsertDetectionSchema.parse({
            Defect_Type: formData.get('Defect_Type') ,
            Defect_Severity: formData.get('Defect_Severity') ,
            Defect_Status: formData.get("Defect_Status") ,
            Defect_Notes: formData.get("Defect_Notes") || undefined,
            Defect_Location: formData.get("Defect_Location") || undefined,
        });

        let locationOn3dModel = undefined;
        let annotation2D = undefined;
        let sourceImageId = undefined;

        if (data.Defect_Location) {
            // Extract 3D parts
            locationOn3dModel = {
                type: data.Defect_Location.type,
                coordinates: data.Defect_Location.coordinates,
                measurement: data.Defect_Location.measurement,
                labelPosition: data.Defect_Location.labelPosition
            };

            // Extract 2D parts
            annotation2D = data.Defect_Location.annotation2D;
            sourceImageId = data.Defect_Location.sourceImageId;
        }

        const dbdata= {
            id: id,
            type: data.Defect_Type,
            severity: data.Defect_Severity,
            status: data.Defect_Status,
            notes: data.Defect_Notes,
            
            locationOn3dModel: locationOn3dModel, 
            annotation2D: annotation2D ?? undefined,       
            sourceImageId: sourceImageId ?? undefined       
        };

        await prisma.detection.upsert({
            where:{
                id: id 
            },
            update: dbdata,
            create: {...dbdata, analysisId: analysis.id,},
        });

        if (filesKeys && filesKeys.length > 0) {
            for (const key of filesKeys) {
                const name = key.split("/").pop() ?? "attachment";
                
                console.log("--- Attempting to create attachment ---");
                console.log("Key:", key);
                console.log("Linking to Defect ID:", id);

                try {
                   
                    const newRecord = await attachmentData.createAttachment({
                        name: name,
                        entity: "DETECTION",
                        entityId: id,
                        url: key
                    });
                    
                    console.log("✅ DB Record Created:", newRecord);
                    
                    if (!newRecord.detectionId) {
                        console.error("⚠️ WARNING: Record created but detectionId is NULL. Check create-attachment.ts mapping.");
                    }
                } catch (dbError) {
                    console.error("❌ Database Error:", dbError);
                }
            }
        }

    }catch (error){
        return formErrorToActionState(error, formData);
    }


    //revalidatePath(three_D_viewer_Path(projectId, inspectionId));

    if (id){
        await setCookieByKey("toast", "Defect Updated!")
        
    }
  
    return toActionState('Success',  'Defect Saved')
};

export {UpsertDetection};