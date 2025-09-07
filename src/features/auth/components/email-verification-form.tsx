"use client";
import { FieldErrorMsg } from "@/components/forms/field-error";
import { Form } from "@/components/forms/form";
import { SubmitButton } from "@/components/forms/submit-buttton";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";
import { emailVerification } from "../actions/email-verification";


export const EmailVerificationForm = () => {
    const [actionState, action]= useActionState(emailVerification, EMPTY_ACTION_STATE)
    return ( 
        <Form action={action} actionState={actionState} >

            <Input name="code" placeholder="Code"  
                defaultValue={ actionState.payload?.get('code') as string } />
            <FieldErrorMsg name="code" actionState={actionState} />

            <SubmitButton label="Verify Email" />
        </Form>
     );
};