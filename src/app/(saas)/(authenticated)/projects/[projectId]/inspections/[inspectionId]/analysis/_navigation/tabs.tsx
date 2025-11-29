'use client';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tabular_analysis_Path, three_D_viewer_Path } from "@/path";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const AnalysisTabs = ({projectId, inspectionId}: {projectId: string, inspectionId:string}) => {
     const pathName= usePathname();
    return ( 
        <Tabs value={pathName.split('/').at(-1)} >
            <TabsList>
                <TabsTrigger value="3d_viewer" asChild >
                    <Link href={three_D_viewer_Path(projectId, inspectionId)} >3D Viewer</Link>
                </TabsTrigger>
                <TabsTrigger value="table" asChild >
                    <Link href={tabular_analysis_Path(projectId, inspectionId)} >Tabular Results</Link>
                </TabsTrigger>
            </TabsList>
        </Tabs>
     );
}

