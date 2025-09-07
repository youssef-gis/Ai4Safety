import { emailVerificationPath, onboardingPath, 
    selectActiveOrganizationPath, signInPath } from "@/path";
import { redirect } from "next/navigation";
import { getAuth } from "./get-auth";
import { getOrganizationsByUserId } from "@/features/organization/queries/get-organizations-by-user";


type GetAuthOrRedirectOptions = {
    checkEmailVerified?:boolean,
    checkOrganization?:boolean,
    checkActiveOrganization?:boolean,
}

export const getAuthOrRedirect = async (options?: GetAuthOrRedirectOptions) => {
    const { checkEmailVerified = true ,
            checkOrganization = true ,
            checkActiveOrganization = true } = options ?? {};

    const authUser = await getAuth();
    if(!authUser.user){
        redirect(signInPath());
        
    };
    
    if( checkEmailVerified && !authUser.user.emailVerified){
        redirect(emailVerificationPath());
    };

    let activeOrganization;
    
    if( checkOrganization || checkActiveOrganization ){
        const organizations = await getOrganizationsByUserId();

        if(checkOrganization && !organizations.length){
            redirect(onboardingPath());
        };
        
        activeOrganization = organizations.find((org)=>{
            return org.membershipByUser.isActive})
        
        const hasActiveOrganization= !!activeOrganization;
        
        if( checkActiveOrganization && !hasActiveOrganization){
            redirect(selectActiveOrganizationPath())
        }
    };

    return {...authUser, activeOrganization};
};