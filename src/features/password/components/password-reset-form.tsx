'use client';
import { FieldErrorMsg } from "@/components/forms/field-error";
import { Form } from "@/components/forms/form";
import { SubmitButton } from "@/components/forms/submit-buttton";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";
import { Input } from "@/components/ui/input";

import { useActionState } from "react";
import { passwordReset } from "../actions/password-reset";

type PasswordResetFormsProps = {
    tokenId: string
}

export const PasswordResetForm = ( {tokenId}: PasswordResetFormsProps ) => {
    const [actionState, action]= useActionState(
        passwordReset.bind(null, tokenId), 
        EMPTY_ACTION_STATE)
    return ( 
        <Form action={action} actionState={actionState} >

            <Input name="password" type="password" placeholder="Password"  
                defaultValue={ actionState.payload?.get('password') as string } />
            <FieldErrorMsg name="password" actionState={actionState} />

            <Input name="confirmPassword" type="password" placeholder="Confirm Password"  
                defaultValue={ actionState.payload?.get('confirmPassword') as string } />
            <FieldErrorMsg name="confirmPassword" actionState={actionState} />

            <SubmitButton label="Reset Password" />
        </Form>
     );
}
