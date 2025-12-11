'use client';
import { FieldErrorMsg } from "@/components/forms/field-error";
import { Form } from "@/components/forms/form";
import { SubmitButton } from "@/components/forms/submit-buttton";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";
import { Input } from "@/components/ui/input";

import { useActionState } from "react";
import { passwordChange } from "../actions/password-change";
import { Label } from "@/components/ui/label";


export const PasswordChangeForm = () => {
    const [actionState, action]= useActionState(passwordChange, EMPTY_ACTION_STATE)
    return ( 
        <Form action={action} actionState={actionState}>
            <div className="space-y-6" >
                <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <Input name="password" placeholder="Password" type="password"  
                            defaultValue={ actionState.payload?.get('password') as string } />
                    <FieldErrorMsg name="password" actionState={actionState} />
                </div>
                <div className="flex justify-center pt-2">
                    <SubmitButton label="Send Email" disabled={false} />
                </div>
            </div>
        </Form>
     );
}