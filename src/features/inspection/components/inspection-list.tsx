
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getInspections } from "../queries/get-inspections";

import { InspectionDeleteButton } from "./inspection-delete-button";
import { InspectionItem } from "./inspection-item";
import { Inspection } from "@prisma/client";

//import { useRouter } from "next/navigation";


export const revalidate = 0;

type InspectionListPageProp = {
    userId : string;
    projectId: string;
    canDelete: boolean;
};


export const InspectionList = async ({userId ,projectId, canDelete}:InspectionListPageProp) => {
    //const router = useRouter();
    const inspections =  await getInspections(projectId);
    
    return ( 
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>title</TableHead>
                    {/* <TableHead>Email</TableHead> */}
                    <TableHead>inspection Date</TableHead>
                    <TableHead>status</TableHead>
                    {/* <TableHead>Role</TableHead>
                    <TableHead>Can Delete</TableHead> */}
                </TableRow>
            </TableHeader>

            <TableBody>
                {inspections.map((inspection)=>
                    <InspectionItem inspection={inspection}  key={inspection.id} canDelete={canDelete}/>
                
                )}
            </TableBody>
        </Table>
     );
}



