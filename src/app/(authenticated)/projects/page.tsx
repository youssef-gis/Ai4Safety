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

type ProjectsPageProps = {
  searchParams: SearchParams;
}

export default async function ProjectsPage({searchParams}: ProjectsPageProps) {
  const {user}= await getAuthOrRedirect()
  return (
    <div className="flex-1 flex flex-col gap-y-8">
    
    <Heading title='Projects Page' 
            description='All projects in one place'
            actions= {
              <Button asChild>
                  <Link href={projectCreatePath()} >
                      <LucidePlus className="w-4 h-4" />
                      Create Project
                  </Link>
              </Button>
                }
    />
    
            <Suspense fallback={<Spinner />}>
                {/* @ts-expect-error Async Server Component */}
                <ProjectLisT   byOrganization searchParams={searchParamsCache.parse(searchParams)} />
            </Suspense>
    </div>
  );
}
