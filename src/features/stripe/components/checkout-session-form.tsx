"use client";

import clsx from "clsx";
import { useActionState } from "react";import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "../actions/create-checkout-session";
import { createCustomerPortal } from "../actions/create-customer-portal";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";
import { Form } from "@/components/forms/form";

type CheckoutSessionFormProps = {
  organizationId: string | null | undefined;
  priceId: string;
  activePriceId: string | null | undefined;
  children: React.ReactNode;
};

const CheckoutSessionForm = ({
  organizationId,
  priceId,
  activePriceId,
  children,
}: CheckoutSessionFormProps) => {
  const [actionState, action] = useActionState(
    !activePriceId
      ? createCheckoutSession.bind(null, organizationId, priceId)
      : createCustomerPortal.bind(null, organizationId),
    EMPTY_ACTION_STATE
  );

  const isActivePrice = activePriceId === priceId;

  return (
    <Form action={action} actionState={actionState}>
      <Button
        type="submit"
        disabled={isActivePrice}
        className={clsx("flex flex-col", {
          "h-16": !!activePriceId,
        })}
      >
        {!activePriceId ? null : isActivePrice ? (
          <span>Current Plan</span>
        ) : (
          <span>Change Plan</span>
        )}
        <div>{children}</div>
      </Button>
    </Form>
  );
};

export { CheckoutSessionForm };