import { CardElement } from "@/components/card-compact";
import { PasswordResetForm } from "@/features/password/components/password-reset-form";

type PasswordResetPageProps = {
    params: Promise<{
        tokenId: string;
    }>
}

const PasswordResetPage = async ({params}: PasswordResetPageProps) => {
    const {tokenId}= await params;
    return ( 
        <>
        <div className="flex-1 flex flex-col
         justify-center items-center" >
            <CardElement title="New Password" 
            description="Enter your new password"
            className="w-full max-w-[420px]"
            content={<PasswordResetForm  tokenId = {tokenId} />} 
           />
        </div>
        </>
     );
}
 
export default PasswordResetPage;

