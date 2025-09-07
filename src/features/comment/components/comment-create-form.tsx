'use client';
import { Textarea } from "@/components/ui/textarea";
import { createComment } from "../actions/create-comment";
import { SubmitButton } from "@/components/forms/submit-buttton";
import { useActionState } from "react";
import { ActionState, EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";
import { Form } from "@/components/forms/form";
import { FieldErrorMsg } from "@/components/forms/field-error";
import { CommentWithMetadata } from "../types";
import { Input } from "@/components/ui/input";
import { ACCEPTED } from "@/features/attachments/constants";

type CommentCreateFormProps = {
    ticketId: string;
    onCreateComment?: (comment: CommentWithMetadata | undefined)=>void;
};

export const CommentCreateForm = ({ticketId, onCreateComment}: CommentCreateFormProps) => {
    const[actionState,action]= useActionState(
        createComment.bind(null, ticketId),EMPTY_ACTION_STATE)
    
    const handleSuccess = (
        actionState: ActionState<CommentWithMetadata | undefined>)=>
    {
        onCreateComment?.(actionState.data );
    };

    return ( 
        <Form action={action} actionState={actionState} onSuccess={handleSuccess}>
            <Textarea 
                name="content" 
                placeholder="Write your comment" />
            <FieldErrorMsg name='Comment' actionState={actionState}/>

        <Input
            name="files"
            id="files"
            type="file"
            multiple
            accept={ACCEPTED.join(",")}
        />
        <FieldErrorMsg actionState={actionState} name="files" />


            <SubmitButton label="Comment" />
        </Form>
     );
}