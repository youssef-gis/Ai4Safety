import { CardElement } from "@/components/card-compact";
import { OrganizationCreateForm } from "@/features/organization/components/organization-create-form";

const onboardingPage = () => {
    return ( 
        <div className="flex-1 flex  flex-col justify-center items-center">
            <CardElement
                title="Create Organization"
                description="Create your organization to get started"
                className="w-full max-w-[420px]"
                content={<OrganizationCreateForm />}
            />
        </div>
     );
}
 
export default onboardingPage;