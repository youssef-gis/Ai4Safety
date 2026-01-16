'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { LucideArrowRightCircle, LucideArrowUpRightFromSquare, LucideBan, LucideCheck } from "lucide-react";
import { getInspections } from "../queries/get-inspections";
import { InspectionMoreMenu } from "./inspection-more-menu";
import {PermissionToggle} from './permission-toggle';
import { InspectionDeleteButton } from "./inspection-delete-button";
import { Inspection } from "@prisma/client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {  projectViewerPath } from "@/path";

type InspectionItemPageProp = {
   
    inspection: Inspection ;
    canDelete: boolean;
}



export const InspectionItem = ({ inspection, canDelete}:InspectionItemPageProp) => {

    //const inspections = await getInspections(projectId);
    // const inspectionMoreMenu= (
    //         <InspectionMoreMenu
    //             projectId= {inspection.projectId}
    //             conductedByUserId= {inspection.conductedByUserId}
    //            // inspectionRole= {inspection.inspectionRole}
    //         />
    //    )

    const detailButton =  (
        <Button variant="default" size="icon" asChild>
            {/* 2. Update the Link href */}
            {/* Pass BOTH projectId and inspectionId to load that specific date */}
            <Link href={projectViewerPath(inspection.projectId, inspection.id)}>
                <LucideArrowRightCircle className="h-4 w-4" />                        
            </Link>
        </Button>
        );

    const deleteButton= (
            <InspectionDeleteButton 
                            inspectionId= {inspection.id}
                            conductedByUserId= {inspection.conductedByUserId}
                        />
                    )
    const buttons= <>{inspection.status==='COMPLETED' && detailButton}{ canDelete && deleteButton}</>;
    
    return ( 
        <TableRow key={inspection.id} >
                <TableCell>{inspection.title}</TableCell>
                    {/* <TableCell>{inspection.conductedByUser?.email}</TableCell> */}
                <TableCell>
                    {format(inspection.inspectionDate , "yyyy-MM-dd")}
                </TableCell>
                {/* <TableCell>
                                {inspection.conductedByUser?.emailVerified ? (
                                    <LucideCheck className="h-4 w-4" />
                                ): (
                                    <LucideBan className="h-4 w-4" />
                                )}
                </TableCell> */}
                <TableCell>{inspection.status}</TableCell>
                {/* <TableCell>
                    <PermissionToggle
                        userId={inspection.userId}
                            organizationId={inspection.organizationId}
                            permissionKey="canDeleteTicket"
                            permissionValue= {inspection.canDeleteTicket}
                    />
                </TableCell> */}
                <TableCell className="flex justify-end gap-x-2">
                    {buttons}
                </TableCell>
        </TableRow>
    )

}