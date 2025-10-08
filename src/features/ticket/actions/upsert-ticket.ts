'use server';
import {  setCookieByKey } from '@/actions/cookies';
import {formErrorToActionState, ActionState, toActionState} from '@/components/forms/utils/to-action-state';
import {prisma} from '@/lib/prisma';
import { ticketPath, ticketsPath } from '@/path';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {toCent} from "@/utils/currency"
import {z} from 'zod';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-rerdirect';
import { IsOwner } from '@/features/auth/utils/is-owner';


const UpsertTicketSchema= z.object({
    title:z.string().min(1).max(100),
    content: z.string().min(1).max(1024),
    deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Is required"),
    bounty: z.coerce.number().positive(),
});


const UpsertTicket = async (id: string | undefined,
    _actionStat:ActionState ,
    formData: FormData) =>{
    const {user, activeOrganization}= await getAuthOrRedirect()
    

    try{
        if(!user){
            return toActionState('Error', 'Not Authenticated')
        }
        if(id){
            const ticket = await prisma.ticket.findUnique({
                where: {
                    id,
                }
            })

            if(!ticket || !IsOwner(user, ticket)){
                return toActionState('Error', 'Not authorized');
            }
        }
        const data= UpsertTicketSchema.parse({
            title: formData.get('title') ,
            content: formData.get('content') ,
            deadline: formData.get("deadline") ,
            bounty: formData.get("bounty")   ,
        });

        const dbdata= {
            ...data,
            userId: user.id,
            bounty: toCent(data.bounty)
        }

        await prisma.ticket.upsert({
            where:{
                id: id || ""
            },
            update: dbdata,
            create: {...dbdata, organizationId: activeOrganization!.id,},

        });
    }catch (error){
        return formErrorToActionState(error, formData);
    }


    revalidatePath(ticketsPath());

    if (id){
        await setCookieByKey("toast", "Ticket Updated!")
        redirect(ticketPath(id));

    }
  
    return toActionState('Success','Ticket Created')
};

export {UpsertTicket};