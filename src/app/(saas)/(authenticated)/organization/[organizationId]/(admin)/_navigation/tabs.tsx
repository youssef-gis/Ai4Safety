'use client';
import { Breadcrumbs } from "@/components/breadcrumbs";
import { credentialsPath, invitationsPath, membershipsPath, 
    organizationPath, subscriptionPath } from "@/path";
import { useParams, usePathname } from "next/navigation";

export const OrganizationBreadCrumbs = () => {
    const params = useParams<{organizationId: string}>();
    const pathname = usePathname();

    const title = {
        memberships: "Memberships" as const,
        invitations: "Invitations" as const,
        credentials: "Credentials" as const,
        subscription: "Subscription" as const,
    }[
        pathname.split('/').at(-1)  as 
        |  "memberships" 
        |  "invitations" 
        |  "credentials"
        |  "subscription"
    ] ;

    return ( 
        <Breadcrumbs
            breadcrumbs={[
                {title: "Organizations", href:organizationPath()},
                {title,
                    dropdown:[
                        {
                            title: "Memberships",
                            href: membershipsPath(params.organizationId)
                        },
                        {
                            title:"Invitations",
                            href: invitationsPath(params.organizationId)
                        },
                        {
                            title:"Credentials",
                            href: credentialsPath(params.organizationId)
                        },
                        {
                            title:"Subscription",
                            href: subscriptionPath(params.organizationId)
                        }
                    ]
                },
            ]}
        />
     );
}