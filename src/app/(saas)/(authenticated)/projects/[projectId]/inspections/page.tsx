import Heading from "@/components/heading";
import { Spinner } from "@/components/spinner";
import { MembershipList } from "@/features/membership/components/membership-list";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { inspectionsCreatePath, projectsPath, projectPath } from "@/path";
import { getProject } from "@/features/project/queries/get-project";
import { ProjectBreadCrumbs } from "../_navigation/tabs";
import { LucidePlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InspectionList } from "@/features/inspection/components/inspection-list";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { toActionState } from "@/components/forms/utils/to-action-state";
import { getInspectionPermissions } from "@/features/inspection/permissions/get-inspection-permissions";

type InspectionsPageProps = {
    params: Promise<{projectId: string}>;
};
const Inspectionspage = async({params}:InspectionsPageProps) => {
    const {projectId}= await params;
    const {user, activeOrganization}= await getAuthOrRedirect();
        
    if (!user || !activeOrganization) {
            return toActionState('Error', 'Not Authenticated');
    }
        
    const permissions = await getInspectionPermissions({
                    userId: user.id,
                    organizationId: activeOrganization.id
 });
        

    //const isAdmin = activeOrganization?.membershipByUser.membershipRole ===  'ADMIN';
    const project = await getProject(projectId);
    if(!project) return null
    return ( 
        <div className="flex-1 flex flex-col gap-y-8" >
            <Heading 
                title="Inspections"
                description="Manage the inspections related to your project"
                tabs={< ProjectBreadCrumbs projectName={project.name} />}
                actions= {
                    permissions.canEditInspection && (<Button asChild>
                        <Link href={inspectionsCreatePath(projectId)} >
                            <LucidePlus className="w-4 h-4" />
                            Start Inspection
                        </Link>
                    </Button>)
                }
            />

            <Suspense fallback={<Spinner/>} >
                <InspectionList userId = {user.id} projectId={projectId} canDelete= {permissions.canDeleteInspection} />
            </Suspense>
        </div>
     );
}
 
export default Inspectionspage;