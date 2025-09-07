'use client'
import { Button } from "@/components/ui/button";
import { LucideLoaderCircle, LucideTrash } from "lucide-react";
import { deleteComment } from "../actions/delete-comment";
import { useConfirmDialog } from "@/components/confirm-dialogue";

type CommentDeleteProps = {
    id: string;
    onDeleteComment?: (id: string)=>void; 
}

export const CommentDeleteButton = ({id, onDeleteComment}: CommentDeleteProps) => {
    const [deleteButton, deleteDialog]= useConfirmDialog({
        action: deleteComment.bind(null, id),
        trigger: (isPending)=> (
            <Button variant='outline' size='icon'>
                {isPending ?
                 (<LucideLoaderCircle className='w-4 h-4 animate-spin' />)
                : ( <LucideTrash className='w-4 h-4' />)
                }
            </Button>
        ),
        onSuccess: ()=> onDeleteComment?.(id),
    })
    return ( 
        <>
        {deleteDialog}
        {deleteButton}
        </>

     );
}