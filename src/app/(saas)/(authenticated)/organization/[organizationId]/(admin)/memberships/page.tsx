import Heading from "@/components/heading";
import { Spinner } from "@/components/spinner";
import { MembershipList } from "@/features/membership/components/membership-list";
import { Suspense } from "react";
import { OrganizationBreadCrumbs } from "../_navigation/tabs";
import { InvitationCreateButton } from "@/features/invitation/components/invitation-create-button";

type MembershipsPageProps = {
    params: Promise<{organizationId: string}>;
};
const Membershipspage = async({params}:MembershipsPageProps) => {
    const {organizationId}= await params;
    return ( 
        <div className="flex-1 flex flex-col gap-y-8" >
            <Heading 
                title="Memberships"
                description="Manage memberships in your organization"
                tabs={<OrganizationBreadCrumbs />}
                actions= {<InvitationCreateButton 
                    organizationId={organizationId} />}
            />

            <Suspense fallback={<Spinner/>} >
                <MembershipList organizationId={organizationId} />
            </Suspense>
        </div>
     );
}
 
export default Membershipspage;