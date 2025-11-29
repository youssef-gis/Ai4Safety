'use server';
import {  setCookieByKey } from '@/actions/cookies';
import {formErrorToActionState, ActionState, toActionState} from '@/components/forms/utils/to-action-state';
import {prisma} from '@/lib/prisma';
import { projectPath,  projectsPath } from '@/path';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {z} from 'zod';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-rerdirect';
import { IsOwner } from '@/features/auth/utils/is-owner';


const UpsertProjectSchema= z.object({
    name:z.string().min(1).max(100),
    description: z.string().min(1).max(1024),
    //updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Is required"),
    address: z.string().min(1).max(100),
});


const UpsertProject = async (id: string | undefined,
    _actionStat:ActionState ,
    formData: FormData) =>{
    const {user, activeOrganization}= await getAuthOrRedirect()
    //console.log(user, activeOrganization)

    try{
        if(!user){
            return toActionState('Error', 'Not Authenticated')
        }
        if(id){
            const project = await prisma.project.findUnique({
                where: {
                    id,
                }
            })

            if(!project || !IsOwner(user, project)){
                return toActionState('Error', 'Not authorized');
            }
        }
        const data= UpsertProjectSchema.parse({
            name: formData.get('name') ,
            description: formData.get('description') ,
            //updatedAt: formData.get("deadline") ,
            address: formData.get("address")   ,
        });

        const dbdata= {
            ...data,
            creatorId: user.id,
            //bounty: toCent(data.bounty)
        }

        await prisma.project.upsert({
            where:{
                id: id || ""
            },
            update: dbdata,
            create: {...dbdata, organizationId: activeOrganization!.id,},

        });
    }catch (error){
        return formErrorToActionState(error, formData);
    }


    revalidatePath(projectsPath());

    if (id){
        await setCookieByKey("toast", "Project Updated!")
        redirect(projectPath(id));

    }
  
    return toActionState('Success','Project Created')
};

export {UpsertProject};