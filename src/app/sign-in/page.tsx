import { CardElement } from "@/components/card-compact";
import { SignInForm } from "@/features/auth/components/sign-in-form";

import { passwordForgotPath, signUpPath } from "@/path";
import Link from "next/link";

const SignInPage = () => {
    return ( 
        <>
        <div className="flex-1 flex flex-col
         justify-center items-center" >
            <CardElement title="Sign In" 
            description="Sign In to your account to get started"
            className="w-full max-w-[420px]"
            content={<SignInForm />} 
            footer={<><Link className="text-sm text-muted-foreground" 
            href={signUpPath()} > No account yet? </Link>
            <Link className="text-sm text-muted-foreground ml-auto" 
                href={passwordForgotPath()} > 
            Forgot Password? 
            </Link>
            </>
            } />
        </div>
        </>
     );
}
 
export default SignInPage;