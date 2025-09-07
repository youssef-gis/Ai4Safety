"use client";

import { useActionState } from "react";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";
import { Form } from "@/components/forms/form";
import { SubmitButton } from "@/components/forms/submit-buttton";
import { acceptInvitation } from "../actions/accept-invitation";

type InvitationAcceptFormProps = {
  tokenId: string;
};

const InvitationAcceptForm = ({ tokenId }: InvitationAcceptFormProps) => {
  const [actionState, action] = useActionState(
    acceptInvitation.bind(null, tokenId),
    EMPTY_ACTION_STATE
  );

  return (
    <Form action={action} actionState={actionState}>
      <SubmitButton label="Accept" />
    </Form>
  );
};

export { InvitationAcceptForm };