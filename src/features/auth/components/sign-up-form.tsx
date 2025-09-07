'use client';

import { Form } from "@/components/forms/form";
import { SubmitButton } from "@/components/forms/submit-buttton";
import { Input } from "@/components/ui/input";
import { SignUp } from "../actions/sign-up";
import { useActionState } from "react";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";
import { FieldErrorMsg } from "@/components/forms/field-error";

const SignUpForm = () => {
    const [actionState, action]= useActionState(SignUp, EMPTY_ACTION_STATE)
    return ( 
        <Form action={action} actionState={actionState} >
            <Input name="username" placeholder="username" 
                defaultValue={ actionState.payload?.get('username') as string }/>
            <FieldErrorMsg name="username" actionState={actionState} />

            <Input name="email" placeholder="Email" 
                defaultValue={ actionState.payload?.get('email') as string }/>
            <FieldErrorMsg name="email" actionState={actionState} />

            <Input name="password" placeholder="Password" type="password" 
                defaultValue={ actionState.payload?.get('password') as string }/>
            <FieldErrorMsg name="password" actionState={actionState} />

            <Input name="confirmPassword" 
                placeholder="Confirm Password" 
                type="password" 
                defaultValue={ actionState.payload?.get('confirmPassword') as string }/>
            <FieldErrorMsg name="confirmPassword" actionState={actionState} />

            <SubmitButton label="Sign Up" />
        </Form>
     );
}

export {SignUpForm}