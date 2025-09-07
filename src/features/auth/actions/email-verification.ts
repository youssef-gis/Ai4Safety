'use server';

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
import { getAuthOrRedirect } from '../queries/get-auth-or-rerdirect';
import { setCookieByKey } from '@/actions/cookies';
import { validateEmailVerificationCode } from '../utils/validate-email-verification-code';


const emailVerificationSchema = z.object({

    code: z.string().length(8),
  });

const emailVerification =  async (_actionState:ActionState, 
    formData: FormData) => {
    
    const {user} = await getAuthOrRedirect({
        checkEmailVerified:false,
        checkOrganization: false,
        checkActiveOrganization: false,
    });
    
    try {
        const { code }= emailVerificationSchema.parse(
            {code: formData.get('code')}
        );

        const validCode = await validateEmailVerificationCode(
            user.id,
            user.email,
            code
        );

        if(!validCode){
            return toActionState('Error', 'Invalid code');
        };

        await prisma.session.deleteMany({
            where:{
                userId: user.id,
            },
        });

        await prisma.user.update({
            where:{
                id: user.id,
            },
            data:{
                emailVerified: true,
            },
        });

        const sessionToken = generateRandomToken();
        const session= await createSession(sessionToken, user.id);
        
        await setSessionCookie(sessionToken, session.expiresAt);
       
    } catch (error) {
      return  formErrorToActionState(error, formData)
    }   

    await setCookieByKey('toast', 'Email Verified');
    redirect(ticketsPath())
    

};

export { emailVerification }