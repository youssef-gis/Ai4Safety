'use server';

import { ActionState, 
    formErrorToActionState, 
    toActionState } from "@/components/forms/utils/to-action-state";
import { prisma } from "@/lib/prisma";
 
import z from "zod";
import { inngest } from "@/lib/inngest";



const passwordForgotSchema = z.object({

    email: z.string().min(1, { message: "Is required" }).max(191).email(),
  });

const passwordForgot =  async (_actionState:ActionState, formData: FormData) => {
    try {
        const { email}= passwordForgotSchema.parse(
            Object.fromEntries(formData)
        );

        const user = await prisma.user.findUnique({
            where: {email},
        }
        );

        if(!user){
            return toActionState('Success', 'Check your email for a reset link');
        }

        await inngest.send({
            name: 'app/password.password-reset',
            data:{userId: user.id},
        });


    } catch (error) {
      return  formErrorToActionState(error, formData)
    }   

    return toActionState('Success', 'Check your email for a reset link');
    

};

export { passwordForgot }