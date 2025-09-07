import { CardElement } from "@/components/card-compact";
import { EmailVerificationForm } from "@/features/auth/components/email-verification-form";
import { EmailVerificationResendForm } from "@/features/auth/components/email-verification-resend-form";



const EmailVerificationPage = () => {
    return ( 
        
        <div className="flex-1 flex flex-col
         justify-center items-center" >
            <CardElement title="Email Verification" 
            description="Verify your account to get started"
            className="w-full max-w-[420px]"
            content={
            <div className="flex flex-col gap-y-2" >
                <EmailVerificationForm /> 
                <EmailVerificationResendForm /> 
            </div>
           } 
            />
        </div>
     );
}
 
export default EmailVerificationPage;