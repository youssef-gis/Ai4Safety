'use client';
import { useConfirmDialog } from "@/components/confirm-dialogue";
import { Button } from "@/components/ui/button";
import { LucideLoaderCircle, LucideLogOut } from "lucide-react";
import { deleteMembership } from "../actions/delete-membership";
import { useRouter } from "next/navigation";

type MembershipDeleteButtonProps={
    organizationId:string;
    userId: string;
}
export const MembershipDeleteButton = (
    {organizationId, userId}: MembershipDeleteButtonProps) => {
        const router = useRouter();
        const [deleteButton, deleteDialog]= useConfirmDialog({
            action: deleteMembership.bind(null, {
                organizationId,
                userId
            }),
            trigger: ((isPening)=> (
                <Button variant="destructive" size='icon' >
                    {isPening ? (
                        <LucideLoaderCircle className="h-4 w-4" />
                    ): 
                    (<LucideLogOut className="w-4 h-4" />)}
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