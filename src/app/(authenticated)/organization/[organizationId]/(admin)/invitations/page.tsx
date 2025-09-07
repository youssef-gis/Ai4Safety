import Heading from "@/components/heading"
import { OrganizationBreadCrumbs } from "../_navigation/tabs"
import { Suspense } from "react"
import { Spinner } from "@/components/spinner"
import { InvitationsList } from "@/features/invitation/components/invitation-list"
import { InvitationCreateButton } from "@/features/invitation/components/invitation-create-button"

type InvitationsPageProps = {
    params: Promise<{
        organizationId: string
    }>
}
const InvitationsPage = async ({params}: InvitationsPageProps) => {
    const {organizationId} = await params
    return ( 
        <div className="flex-1 flex flex-col gap-y-8" >
            <Heading 
                title="Invitations"
                description="Manages your organization's invitations"
                tabs={<OrganizationBreadCrumbs />}
                actions= {<InvitationCreateButton 
                    organizationId={organizationId} />}
            />
            <Suspense fallback={<Spinner />} >
                <InvitationsList organizationId={organizationId} />
            </Suspense>
        </div>
     );
}
 
export default InvitationsPage;