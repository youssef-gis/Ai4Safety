import { CardElement } from "@/components/card-compact";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { signInPath } from "@/path";
import Link from "next/link";

const SignUpPage = () => {
    return ( 
        <>
        <div className="flex-1 flex flex-col
         justify-center items-center" >
            <CardElement title="Sign Up" 
            description="Create an account to get started"
            className="w-full max-w-[420px]"
            content={<SignUpForm />} 
            footer={
                <Link className="text-sm text-muted-foreground" 
                    href={signInPath()} > Have an account? Sign In 
                </Link>
            } />
        </div>
        </>
     );
}
 
export default SignUpPage;