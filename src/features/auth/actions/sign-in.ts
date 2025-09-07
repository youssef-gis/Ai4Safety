'use server';

import {verify} from '@node-rs/argon2';
import { ActionState, 
    formErrorToActionState, 
    toActionState } from "@/components/forms/utils/to-action-state";
import { prisma } from "@/lib/prisma";
 
import z from "zod";
import { createSession } from '@/lib/lucia';
import { generateRandomToken } from '@/utils/crypto';
import { setSessionCookie } from '../utils/session-cookie';
import { redirect } from 'next/navigation';
import { ticketsPath } from '@/path';


const signInSchema = z.object({

    email: z.string().min(1, { message: "Is required" }).max(191).email(),
    password: z.string().min(6).max(191),
  });

const SignIn =  async (_actionState:ActionState, formData: FormData) => {
    try {
        const { email, password}= signInSchema.parse(
            Object.fromEntries(formData)
        );

        const user = await prisma.user.findUnique({
            where: {email},
        }
        );

  
        const verifyPasswd = await verify(user? user.passwordHash :
            '$argon', password);

        if(!user || !verifyPasswd){
            return toActionState('Error', 'Incorrect email or password', formData);
        }
        const sessionToken = generateRandomToken();
        const session= await createSession(sessionToken, user.id);
        
        await setSessionCookie(sessionToken, session.expiresAt);
       
    } catch (error) {
      return  formErrorToActionState(error, formData)
    }   

    redirect(ticketsPath())
    

};

export { SignIn }