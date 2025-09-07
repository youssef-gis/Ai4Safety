import Heading from "@/components/heading";
import { AccountTabs } from "../_navigation/tabs";
import { CardElement } from "@/components/card-compact";
import { PasswordChangeForm } from "@/features/password/components/password-change-form";

const PasswordPage = () => {
   
    return ( 
        <>
            <div className="fles-1 flex flex-col gap-y-8" >
                <Heading title="Password" 
                    description="Your account password "
                    tabs={<AccountTabs /> }        
                />
            <div className="flex-1 flex flex-col items-center" >
                <CardElement title="Change Password" 
                description="Enter your current password"
                className="w-full max-w-[420px]"
                content={<PasswordChangeForm />} 
            />
            </div>
            </div>
        </>
     );
}
 
export default PasswordPage;