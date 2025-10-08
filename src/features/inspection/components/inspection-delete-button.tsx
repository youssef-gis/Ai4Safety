'use client';
import { useConfirmDialog } from "@/components/confirm-dialogue";
import { Button } from "@/components/ui/button";
import { LucideLoaderCircle, LucideLogOut, LucideTrash } from "lucide-react";
import { deleteInspection } from "../actions/delete-inspection";
import { useRouter } from "next/navigation";

type InspectionDeleteButtonProps={
    inspectionId:string;
    conductedByUserId: string | null ; 
}
export const InspectionDeleteButton = (
    {inspectionId, conductedByUserId}: InspectionDeleteButtonProps) => {
        const router = useRouter();
        const [deleteButton, deleteDialog]= useConfirmDialog({
            action: deleteInspection.bind(null, {
                inspectionId,
                conductedByUserId
            }),
            trigger: ((isPending)=> (
                <Button variant="destructive" size='icon' >
                    {isPending ? (
                        <LucideLoaderCircle className="h-4 w-4" />
                    ): 
                    (<LucideTrash className="w-4 h-4" />)}
                </Button>
            )),
            onSuccess: (()=>{router.refresh()})
        })

    return ( 
        <>
        {deleteDialog}
        {deleteButton}
        </>
     );
}