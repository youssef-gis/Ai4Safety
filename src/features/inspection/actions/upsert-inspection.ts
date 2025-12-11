'use server';

import { setCookieByKey } from "@/actions/cookies";
import {formErrorToActionState, ActionState, toActionState} from '@/components/forms/utils/to-action-state';
import {prisma} from '@/lib/prisma';
import {  inspectionsPath, projectPath, supplementDownloadPath,  } from '@/path';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AnalysisType } from "@prisma/client";
import * as inspectionData from "../data";
import * as attachmentSubjectDTO from "@/features/supplements/dto/attachment-subject-dto";
import * as attachmentService from "../../supplements/service";
import { inngest } from "@/lib/inngest";
import {z} from 'zod';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-rerdirect';
import { IsOwner } from '@/features/auth/utils/is-owner';
import { filesSchema } from "@/features/supplements/schema/files";
import { findIdsFromText } from '@/utils/find-ids-from-text';
import { getInspectionPermissions } from "../permissions/get-inspection-permissions";

const JobTypeEnum = z.enum(AnalysisType);

const UpsertInspectionSchema= z.object({
    title:z.string().min(1).max(100),
    //content: z.string().min(1).max(1024),
    inspectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Is required"),
    projectId: z.string().min(1).max(100),
    jobs: z.array(JobTypeEnum).optional().default([]),
    //files: z.array(z.string().min(1)), //  S3 keys,

    
});


const UpsertInspection = async (projectId: string ,inspectionId: string,filesKeys: string[] ,
    _actionStat:ActionState ,
    formData: FormData) =>{

    let inspection;

    try{
        const {user, activeOrganization}=await getAuthOrRedirect();
        
        if (!user || !activeOrganization) {
            return toActionState('Error', 'Not Authenticated');
            }
        
        const permissions = await getInspectionPermissions({
                    userId: user.id,
                    organizationId: activeOrganization.id
            });
        
        if (!permissions.canEditInspection) {
            return toActionState('Error', 'You do not have permission to edit  or create ins.');
            }
        const data_parsed= UpsertInspectionSchema.parse({
            title: formData.get('title') ,
            //content: formData.get('content') ,
            inspectionDate: formData.get("inspectionDate") ,
            projectId,
            jobs: formData.getAll("jobs"),
            //files: formData.getAll('files'),
            
        });

        const isoInspectionDate = new Date(data_parsed.inspectionDate).toISOString();

        inspection = await inspectionData.createInspection({
            id: inspectionId,
            userId: user.id,
            title: data_parsed.title,
            projectId: data_parsed.projectId,
            inspectionDate: isoInspectionDate,
            jobs: data_parsed.jobs,
            options: {
                includeUser: true,
                includeProject: true,
            },
        });

        const subject = attachmentSubjectDTO.fromInspection(inspection);
        if (!subject) {
            return toActionState("Error", "Inspection not created");
        }

        await attachmentService.createAttachments({
            subject: subject,
            entity: "INSPECTION",
            entityId: inspection.id,
            files: filesKeys,
            });
        
        // console.log('Inspection Info: ', inspection)
        // console.log('supplements Info: ', supplements)

        if (inspection.status === "SCHEDULED") {
        await inngest.send({
            name: "app/inspection.started",
            data: {
                inspectionId: inspection.id,
                },
            })
        };
  
        
    }catch (error){
        return formErrorToActionState(error, formData);
    }

   
    revalidatePath(inspectionsPath(projectId ));
    
    await setCookieByKey(
            "toast","Inspection started you will recieve \n an email when the inspection complete",
        ); 

    redirect(inspectionsPath(projectId)); // 👈 navigate to inspections page
    //return toActionState('Success','Inspection Started')
};

export {UpsertInspection};