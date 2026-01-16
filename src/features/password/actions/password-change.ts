'use server';

import { ActionState, 
    formErrorToActionState, 
    toActionState } from "@/components/forms/utils/to-action-state";

 
import z from "zod";
import {  verifyPasswordHash } from "../utils/hash-and-verify";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { redirect } from "next/navigation";
import { signInPath } from "@/path";
import { inngest } from "@/lib/inngest";



const passwordChangeSchema = z.object({

       password: z.string().min(6).max(191),
  });

const passwordChange =  async (_actionState:ActionState, formData: FormData) => {
    const auth = await getAuthOrRedirect();

    if(!auth.user){
            redirect(signInPath());
            
        }

    try {
        const { password } = passwordChangeSchema.parse(
            Object.fromEntries(formData)
        );

        const validPassword = await verifyPasswordHash(
            auth.user.passwordHash, password)
        
        if(!validPassword){
                return toActionState('Error', 'Incorrect Password', formData);
            }
        
        await inngest.send({
            name: 'app/password.password-reset',
            data:{userId: auth.user.id},
        });

        
    } catch (error) {
      return  formErrorToActionState(error, formData)
    }   

    return toActionState('Success', 'Check your email for a reset link');
    

};

export { passwordChange }