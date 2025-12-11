'use client';
import { Form } from "@/components/forms/form";
import { SubmitButton } from "@/components/forms/submit-buttton";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";
import { LucideBan, LucideCheck } from "lucide-react";
import { useActionState } from "react";
import { togglePermission } from "../actions/toggle-permission";
import { Membership } from "@prisma/client";

type PermissionKey = keyof Pick<Membership,  
  'canDeleteInspection' | 
  'canEditInspection' |
  'canDeleteDefect' |
  'canEditDefect'
>;

type PermissionToggleProps = {
    userId: string,
    organizationId: string,
    permissionKey: PermissionKey,
    permissionValue:boolean,
    disabled?:boolean
}
export const PermissionToggle = ({
    userId,
    organizationId,
    permissionKey,
    permissionValue,
    disabled = false
}: PermissionToggleProps) => {
    const [actionState, action] = useActionState(
        togglePermission.bind(null, {
            userId,
            organizationId,
            permissionKey
        }),
        EMPTY_ACTION_STATE
    )
    return ( 
        <Form actionState={actionState} action={action}>
            <SubmitButton 
                icon={permissionValue ? <LucideCheck /> : <LucideBan />}
                size="icon"
                variant={permissionValue ? 'secondary': 'ghost'} // Ghost looks cleaner in a table
                //className={permissionValue ? "text-green-600 bg-green-50 hover:bg-green-100" : "text-muted-foreground"}
                disabled={disabled}
            />
        </Form>
     );
}