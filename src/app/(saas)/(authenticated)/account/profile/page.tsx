'use server';
import Heading from "@/components/heading";
import { AccountTabs } from "../_navigation/tabs";
import { CardElement } from "@/components/card-compact";
import { ProfileForm } from "@/features/profile/components/profile-form"; 
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { toActionState } from "@/components/forms/utils/to-action-state";
import { getUserProfile } from "@/features/profile/queries/get-user-profile";

const ProfilePage = async () => {
    const {user , activeOrganization}= await getAuthOrRedirect();
    if (!user || !activeOrganization) {
                  return toActionState('Error', 'Not Authenticated');
    } ;

    const userData = await getUserProfile(user.id);
    //console.log('userData profile page', userData);
    if(!userData){
        return toActionState('Error', 'User not found');
    }
    return ( 
        <div className="flex-1 flex flex-col gap-y-8">
            <Heading 
                title="Profile" 
                description="All your profile information" 
                tabs={<AccountTabs />}    
            />

            <div className="flex-1 flex flex-col items-center">
                <CardElement 
                    title="Personal Details" 
                    description="Manage your public profile and private information"
                    className="w-full max-w-3xl"
                    content={<ProfileForm user={userData} />} 
                />
            </div>
        </div>
     );
}
 
export default ProfilePage;