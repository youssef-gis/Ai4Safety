import { Suspense } from "react";

import { Spinner } from "@/components/spinner";
import { OrganizationBreadCrumbs } from "../_navigation/tabs";
import Heading from "@/components/heading";
import { CredentialCreateButton } from "@/features/credential/components/credential-create-button";
import { CredentialList } from "@/features/credential/components/credential-list";

type CredentialsPageProps = {
  params: Promise<{
    organizationId: string;
  }>;
};

const CredentialsPage = async ({ params }: CredentialsPageProps) => {
  const { organizationId } = await params;

  return (
    <div className="flex-1 flex flex-col gap-y-8">
      <Heading
        title="Credentials"
        description="Manage your organization's API secrets"
        tabs={<OrganizationBreadCrumbs />}
        actions={<CredentialCreateButton organizationId={organizationId} />}
      />

      <Suspense fallback={<Spinner />}>
        <CredentialList organizationId={organizationId} />
      </Suspense>
    </div>
  );
};

export default CredentialsPage;