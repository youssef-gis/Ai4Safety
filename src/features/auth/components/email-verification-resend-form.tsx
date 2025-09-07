'use client';
import { Form } from "@/components/forms/form";
import { SubmitButton } from "@/components/forms/submit-buttton";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";
import { useActionState } from "react";
import { emailVerificationResend } from "../actions/email-verification-resend";

export const EmailVerificationResendForm = () => {
    const [actionState, action]= useActionState(emailVerificationResend, EMPTY_ACTION_STATE)
    return ( 
        <Form action={action} actionState={actionState} >
            <SubmitButton label="Resend Code" />
        </Form>
     );
};