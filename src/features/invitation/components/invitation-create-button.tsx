"use client";

import { LucidePlus } from "lucide-react";
import { useState } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createInvitation } from "../actions/create-invitation";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";
import { Form } from "@/components/forms/form";
import { SubmitButton } from "@/components/forms/submit-buttton";
import { FieldErrorMsg } from "@/components/forms/field-error";

type InvitationCreateButtonProps = {
  organizationId: string;
};

const InvitationCreateButton = ({
  organizationId,
}: InvitationCreateButtonProps) => {
  const [open, setOpen] = useState(false);

  const [actionState, action] = useActionState(
    createInvitation.bind(null, organizationId),
    EMPTY_ACTION_STATE
  );

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <LucidePlus className="w-4 h-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Invite a user by email to your organization
          </DialogDescription>
        </DialogHeader>
        <Form action={action} actionState={actionState} onSuccess={handleClose}>
          <div className="grid gap-4 py-4">
            <div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input name="email" id="email" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div />
                <div className="col-span-3">
                  <FieldErrorMsg actionState={actionState} name="email" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <SubmitButton label="Invite" />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { InvitationCreateButton };