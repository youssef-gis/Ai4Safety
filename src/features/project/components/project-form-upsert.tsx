'use client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Project } from "@prisma/client";

import { SubmitButton } from "@/components/forms/submit-buttton";
import { useActionState, useRef } from "react";
import { FieldErrorMsg } from "@/components/forms/field-error";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";

import { Form } from "@/components/forms/form";

import { DatePicker, ImperativeHandleFromDatePicker } from "@/components/date-picker";
import { UpsertProject } from "../actions/upsert-project";


type ProjectUpdateFormProps = {
    project?: Project;
}

const ProjectUpsertForm = ({project} : ProjectUpdateFormProps) => {
    const [actionState, action]= useActionState(
        UpsertProject.bind(null, project?.id), EMPTY_ACTION_STATE)
    
    const datePickerImperativeHandleRef =useRef<ImperativeHandleFromDatePicker>(null);

    const handleSuccess = () => {
        datePickerImperativeHandleRef.current?.reset();
    }; 

    return (         
     <Form action={action} actionState={actionState} onSuccess={handleSuccess}>
        <Label htmlFor="name">Project Name</Label>
        <Input id="name" name='name' type="text" 
        defaultValue={ (actionState.payload?.get('name') as string ) 
                        ?? project?.name} />
        
        <FieldErrorMsg actionState={actionState} name="name" />

        <Label htmlFor="description" >Description</Label>
        <Textarea name="description" id="description" 
            defaultValue={ (actionState.payload?.get('description') as string ) 
                            ?? project?.description} />
        <FieldErrorMsg actionState={actionState} name="description" />

        {/* <div className="flex gap-x-2  mb-1">  */}
            {/*  <div className="w-1/2">
                <Label htmlFor="updatedAt">Updated At</Label>
                <DatePicker
                
                    id="updatedAt"
                    name="updatedAt"
                    defaultValue={
                    (actionState.payload?.get("updatedAt")) ??
                    project?.updatedAt
                    }
                    imperativeHandleRef={datePickerImperativeHandleRef }
                />
                <FieldErrorMsg actionState={actionState} name="updatedAt" />
            </div> */}
            {/* <div className="w-1/2"> */}
                <Label htmlFor="address">Address</Label>
                <Input
                    id="address"
                    name="address"
                    type="string"
                   
                    defaultValue={
                    (actionState.payload?.get("address") as string ) ??
                    (project?.address ? project?.address : "")
                    }
                />
                <FieldErrorMsg actionState={actionState} name="address" />
            {/* </div> */}
        {/* </div> */}

        <SubmitButton label= {project ? 'Edit': 'Create'} disabled/>
        
    </Form>);
}
 
export  {ProjectUpsertForm};