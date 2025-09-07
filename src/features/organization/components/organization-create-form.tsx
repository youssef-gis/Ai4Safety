'use client';

import { FieldErrorMsg } from "@/components/forms/field-error";
import { Form } from "@/components/forms/form";
import { SubmitButton } from "@/components/forms/submit-buttton";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";
import { createOrganization } from "../actions/create-organization";

export const OrganizationCreateForm = () => {
    const [actionState, action] = useActionState(createOrganization,
        EMPTY_ACTION_STATE
    )
    return ( 
        <Form action={action} actionState={actionState} >
            <Input name='name'
                placeholder="Name"
                defaultValue={actionState.payload?.get('name') as string} 
            />
            <FieldErrorMsg name="name" actionState={actionState}  />

            <SubmitButton label="Create" />
        </Form>
     );
}