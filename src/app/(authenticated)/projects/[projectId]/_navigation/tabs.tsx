'use client';
import { Breadcrumbs } from "@/components/breadcrumbs";

import {  inspectionsPath,  projectsPath,projectPath } from "@/path";
import { useParams, usePathname } from "next/navigation";

export const ProjectBreadCrumbs =  () => {
    const params = useParams<{projectId: string}>();
    const pathname = usePathname();
    

    const title = {
        inspections: "Inspections" as const,
    }[
        pathname.split('/').at(-1)  as 
        |  "inspections" 
    ] ;

    return ( 
        <Breadcrumbs
            breadcrumbs={[
                {title: 'Projects', href:projectsPath()},
                {title: params.projectId,
                    dropdown:[
                            {title:"Project Dashboard",
                            href: projectPath(params.projectId)},
                            {title: "Inspections",
                            href: inspectionsPath(params.projectId)},
                        
                        
                    ]
                },
            ]}
        />
     );
}