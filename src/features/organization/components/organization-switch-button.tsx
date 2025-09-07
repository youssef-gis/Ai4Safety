'use client';
import { Form } from "@/components/forms/form";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";
import { useActionState } from "react";
import { switchOrganization } from "../actions/switch-organization";

type OrganizationSwitchBtnProps = {
    organizationId: string;
    trigger: React.ReactElement;
}
export const OrganizationSwichButton = ({organizationId,
     trigger}: OrganizationSwitchBtnProps) => {
        const [actionState, action] = useActionState(
            switchOrganization.bind(null, organizationId),
            EMPTY_ACTION_STATE
        );
    return (
        <Form action={action} actionState={actionState} >{trigger}</Form>
    );
}