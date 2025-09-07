"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";
import { Form } from "@/components/forms/form";
import { createCustomerPortal } from "../actions/create-customer-portal";

type CustomerPortalFormProps = {
  organizationId: string | null | undefined;
  children: React.ReactNode;
};

const CustomerPortalForm = ({
  organizationId,
  children,
}: CustomerPortalFormProps) => {
  const [actionState, action] = useActionState(
    createCustomerPortal.bind(null, organizationId),
    EMPTY_ACTION_STATE
  );

  return (
    <Form action={action} actionState={actionState}>
      <Button type="submit">{children}</Button>
    </Form>
  );
};

export { CustomerPortalForm };