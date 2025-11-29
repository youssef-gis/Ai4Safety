import Heading from "@/components/heading";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { OrganizationList } from "@/features/organization/components/organization-list";
import { getOrganizationsByUserId } from "@/features/organization/queries/get-organizations-by-user";
import { onboardingPath, organizationPath } from "@/path";
import { LucidePlus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const SelectActiveOrganizationPage = async () => {
    const organizations= await getOrganizationsByUserId();

    const hasActive= organizations.some(org=>org.membershipByUser.isActive);
    if(hasActive){
        redirect(organizationPath());
    }

    return ( 
        <div className="flex-1 flex-col gap-y-8" >
            <Heading title="Select an Organizations" 
                description="Pick an organization to work with" 
                actions= {
                    <Button asChild>
                        <Link href={onboardingPath()} >
                            <LucidePlus className="w-4 h-4" />
                            Create Organization
                        </Link>
                    </Button>
                }/>
            
            <Suspense fallback={<Spinner />} >
                <OrganizationList limitedAccess />
            </Suspense>
        </div>
     );
}
 
export default SelectActiveOrganizationPage;