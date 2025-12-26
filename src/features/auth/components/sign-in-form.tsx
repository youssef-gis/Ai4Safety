'use client';
import { Form } from "@/components/forms/form";
import { SubmitButton } from "@/components/forms/submit-buttton";
import { Input } from "@/components/ui/input";

import { useActionState } from "react";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";
import { FieldErrorMsg } from "@/components/forms/field-error";
import { SignIn } from "../actions/sign-in";

const SignInForm = () => {
    const [actionState, action]= useActionState(SignIn, EMPTY_ACTION_STATE)
    return ( 
        <Form action={action} actionState={actionState} >

            <Input name="email" placeholder="Email"  
                defaultValue={ actionState.payload?.get('email') as string } />
            <FieldErrorMsg name="email" actionState={actionState} />

            <Input name="password" placeholder="Password" type="password" 
                defaultValue={ actionState.payload?.get('password') as string }/>
            <FieldErrorMsg name="password" actionState={actionState} />


            <SubmitButton label="Sign In" disabled />
        </Form>
     );
}

export {SignInForm}