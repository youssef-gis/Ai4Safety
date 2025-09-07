'use client';

import React  from "react";
import { deleteOrganization } from "../actions/delete-organization";
import { useConfirmDialog } from "@/components/confirm-dialogue";

import { LucideLoaderCircle, LucideTrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type OrganizationDeleteBtnProps = {
    organizationId: string;
}
export const OrganizationDeleteButton = (
    {organizationId}:OrganizationDeleteBtnProps) => {
        const router = useRouter()
        const [deleteButton, deleteDialog]= useConfirmDialog({
            action: deleteOrganization.bind(null, organizationId),
            trigger:(isPending)=>(
                <Button variant="destructive" size="icon">
                    {isPending ? 
                    (<LucideLoaderCircle 
                        className="h-4 w-4 animate-spin" />):
                    (<LucideTrash className="h-4 w-4" />)
                    }
                </Button>
                        ),
            onSuccess: ()=>{router.refresh();}
        });
    return ( 
        <>
        {deleteDialog}
        {deleteButton}
        </>
     );
}