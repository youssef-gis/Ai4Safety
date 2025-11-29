'use client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Ticket } from "@prisma/client";

import { SubmitButton } from "@/components/forms/submit-buttton";
import { useActionState, useRef } from "react";
import { FieldErrorMsg } from "@/components/forms/field-error";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";

import { Form } from "@/components/forms/form";
import { fromCent } from "@/utils/currency";
import { DatePicker, ImperativeHandleFromDatePicker } from "@/components/date-picker";
import { UpsertTicket } from "../actions/upsert-ticket";


type TicketUpdateFormProps = {
    ticket?: Ticket;
}

const TicketUpsertForm = ({ticket} : TicketUpdateFormProps) => {
    const [actionState, action]= useActionState(
        UpsertTicket.bind(null, ticket?.id), EMPTY_ACTION_STATE)
    
    const datePickerImperativeHandleRef =useRef<ImperativeHandleFromDatePicker>(null);

    const handleSuccess = () => {
        datePickerImperativeHandleRef.current?.reset();
    }; 

    return (         
     <Form action={action} actionState={actionState} onSuccess={handleSuccess}>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name='title' type="text" 
        defaultValue={ (actionState.payload?.get('title') as string ) 
                        ?? ticket?.title} />
        
        <FieldErrorMsg actionState={actionState} name="title" />

        <Label htmlFor="content" >Content</Label>
        <Textarea name="content" id="content" 
            defaultValue={ (actionState.payload?.get('content') as string ) 
                            ?? ticket?.content} />
        <FieldErrorMsg actionState={actionState} name="content" />

        <div className="flex gap-x-2 mb-1">
            <div className="w-1/2">
                <Label htmlFor="deadline">Deadline</Label>
                <DatePicker
                
                    id="deadline"
                    name="deadline"
                    defaultValue={
                    (actionState.payload?.get("deadline") as string) ??
                    ticket?.deadline
                    }
                    imperativeHandleRef={datePickerImperativeHandleRef }
                />
                <FieldErrorMsg actionState={actionState} name="deadline" />
            </div>
            <div className="w-1/2">
                <Label htmlFor="bounty">Bounty ($)</Label>
                <Input
                    id="bounty"
                    name="bounty"
                    type="number"
                    step=".01"
                    defaultValue={
                    (actionState.payload?.get("bounty") as string ) ??
                    (ticket?.bounty ? fromCent(ticket?.bounty) : "")
                    }
                />
                <FieldErrorMsg actionState={actionState} name="bounty" />
            </div>
        </div>

        <SubmitButton label= {ticket ? 'Edit': 'Create'}  disabled/>
        
    </Form>);
}
 
export  {TicketUpsertForm};