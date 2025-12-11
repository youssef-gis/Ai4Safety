import Heading from "@/components/heading";
import { Spinner } from "@/components/spinner";
import { searchParamsCache } from "@/features/ticket/search-params";
import { ProjectLisT } from "@/features/project/components/project-list";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LucidePlus } from "lucide-react";
import { projectCreatePath } from "@/path";
import { toActionState } from "@/components/forms/utils/to-action-state";
import { getInspectionPermissions } from "@/features/inspection/permissions/get-inspection-permissions";
import { getProjectPermissions } from "@/features/project/permissions/get-project-permissions";

type ProjectsPageProps = {
  searchParams: SearchParams;
}

export default async function ProjectsPage({searchParams}: ProjectsPageProps) {
  const {user , activeOrganization}= await getAuthOrRedirect();
  if (!user || !activeOrganization) {
              return toActionState('Error', 'Not Authenticated');
      }
          
  const permissions = await getProjectPermissions({
                      userId: user.id,
                      organizationId: activeOrganization.id
  });

  console.log('permissions Projects', permissions)

  // const isAdmin = activeOrganization?.membershipByUser.membershipRole ===  'ADMIN';
  return (
    <div className="flex-1 flex flex-col gap-y-8">
    
    <Heading title='Projects' 
            description='All projects in one place'
            actions= {
              permissions.canEditProject && (<Button asChild>
                  <Link href={projectCreatePath()} >
                      <LucidePlus className="w-4 h-4" />
                      Create Project
                  </Link>
              </Button>)
                }
    />
    
            <Suspense fallback={<Spinner />}>
                {/* @ts-expect-error Async Server Component */}
                <ProjectLisT   byOrganization searchParams={searchParamsCache.parse(searchParams)} 
                            canEdit={permissions.canEditProject} canDelete={permissions.canDeleteProject}  
                />
            </Suspense>
    </div>
  );
}
