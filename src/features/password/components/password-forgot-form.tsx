'use client';
import { FieldErrorMsg } from "@/components/forms/field-error";
import { Form } from "@/components/forms/form";
import { SubmitButton } from "@/components/forms/submit-buttton";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";
import { Input } from "@/components/ui/input";

import { useActionState } from "react";
import { passwordForgot } from "../actions/password-forgot";

export const PasswordForgotForm = () => {
    const [actionState, action]= useActionState(passwordForgot, EMPTY_ACTION_STATE)
    return ( 
        <Form action={action} actionState={actionState} >

            <Input name="email" placeholder="Email"  
                defaultValue={ actionState.payload?.get('email') as string } />
            <FieldErrorMsg name="email" actionState={actionState} />

            <SubmitButton label="Send Email"  disabled={false}/>
        </Form>
     );
}