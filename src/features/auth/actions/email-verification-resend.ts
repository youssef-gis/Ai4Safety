'use server';

import { formErrorToActionState, 
    toActionState } from "@/components/forms/utils/to-action-state";
 

import { getAuthOrRedirect } from '../queries/get-auth-or-rerdirect';
import { sendEmailVerification } from "../emails/send-email-verification";
import { generateEmailVerificationCode } from "../utils/generate-email-verification-code";
import { canResendVerificationEmail } from "../utils/can-resend-verification-email";



const emailVerificationResend =  async () => {
    const {user} = await getAuthOrRedirect({
        checkEmailVerified:false,
        checkOrganization: false,
        checkActiveOrganization: false,
    });
    
    try {
        const canResend = await canResendVerificationEmail(user.id);
            if (!canResend) {
            return toActionState(
                "Error",
                "You can only resend the verification email once every minute."
            );
            }
        const verificationCode= await generateEmailVerificationCode(
            user.id, 
            user.email);
        
        const result = await sendEmailVerification(user.username, 
            user.email, 
            verificationCode);
        
        if(result.error){
            return toActionState("Error", 'Failed to send verification email');
        };

    } catch (error) {
      return  formErrorToActionState(error)
    }   

    return toActionState('Success', 'Verification email sent');

};

export { emailVerificationResend }