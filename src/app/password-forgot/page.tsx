import { CardElement } from "@/components/card-compact";
import { PasswordForgotForm } from "@/features/password/components/password-forgot-form";


const PasswordForgot = () => {
    return ( 
        <>
        <div className="flex-1 flex flex-col
         justify-center items-center" >
            <CardElement title="Forgot Password" 
            description="Enter your email address to reset your password"
            className="w-full max-w-[420px]"
            content={<PasswordForgotForm />} 
           />
        </div>
        </>
     );
}
 
export default PasswordForgot;