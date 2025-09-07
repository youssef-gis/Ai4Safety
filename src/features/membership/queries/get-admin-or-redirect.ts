import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { getMembership } from "./get-membership";
import { signInPath } from "@/path";
import { redirect } from "next/navigation";

export const getAdminOrRedirect = async (organizationId: string) => {
    
    const auth = await getAuthOrRedirect();
    const membership = await getMembership({organizationId, 
        userId: auth.user.id,
    });

    if(!membership){
        redirect(signInPath());
    }

    if(membership.membershipRole !== 'ADMIN'){
        redirect(signInPath());
    }

    return { ...auth, membership };
}