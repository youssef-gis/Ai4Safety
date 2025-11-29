import { LucideSettings } from "lucide-react";
import { Suspense } from "react";
import { Spinner } from "@/components/spinner";
import { Products } from "@/features/stripe/components/products";
import { OrganizationBreadCrumbs } from "../_navigation/tabs";
import Heading from "@/components/heading";
import { CustomerPortalForm } from "@/features/stripe/components/customer-portal-form";

type SubscriptionPageProps = {
  params: Promise<{
    organizationId: string;
  }>;
};

const SubscriptionPage = async ({ params }: SubscriptionPageProps) => {
  const { organizationId } = await params;

  return (
    <div className="flex-1 flex flex-col gap-y-8">
      <Heading
        title="Subscription"
        description="Manage your subscription"
        tabs={<OrganizationBreadCrumbs />}
        actions={
          <CustomerPortalForm organizationId={organizationId}>
            <>
              <LucideSettings className="w-4 h-4" />
              Manage Subscription
            </>
          </CustomerPortalForm>
        }
      />

      <Suspense fallback={<Spinner />}>
        <Products organizationId={organizationId} />
      </Suspense>
    </div>
  );
};

export default SubscriptionPage;