'use client';
import { Breadcrumbs } from "@/components/breadcrumbs";

import {  inspectionsPath,  projectsPath,projectPath, projectViewerPath } from "@/path";
import { useParams, usePathname } from "next/navigation";

type ProjectBreadCrumbsProps = {
    projectName: string; // Now required for better UX
    inspectionTitle?: string;
}

export const ProjectBreadCrumbs =  ({ projectName, inspectionTitle }: ProjectBreadCrumbsProps) => {
    const params = useParams<{projectId: string}>();
    const pathname = usePathname();
    

    const projectLevel = {
        title: projectName,
        href: projectPath(params.projectId),
        dropdown: [
            { 
                title: "📊 Dashboard", 
                href: projectPath(params.projectId) 
            },
            { 
                title: "🌍 3D Spatial Hub",  // NEW LINK
                href: projectViewerPath(params.projectId) 
            },
            { 
                title: "📋 Inspection List", 
                href: inspectionsPath(params.projectId) 
            },
        ]
    };

    const breadcrumbs = [
        { title: 'Projects', href: projectsPath() }, // Root
        projectLevel,                                // Project Context
    ];

    if (pathname.endsWith('/inspections')) {
        breadcrumbs.push({
            title: 'Inspections',
            href:''
        });
        if (inspectionTitle) {
            breadcrumbs.push({
                title: inspectionTitle,
                href:''
            });
        }
    }

    return ( 
        <Breadcrumbs
            breadcrumbs={breadcrumbs}
        />
     );
}

