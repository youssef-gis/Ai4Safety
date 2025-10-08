"use client";

import { SupplementEntity } from "@prisma/client";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { createAttachments } from "../actions/create-attachments";
import { ACCEPTED } from "../constants";
import { EMPTY_ACTION_STATE } from "@/components/forms/utils/to-action-state";
import { Form } from "@/components/forms/form";
import { SubmitButton } from "@/components/forms/submit-buttton";
import { FieldErrorMsg } from "@/components/forms/field-error";


type AttachmentCreateFormProps = {
  entityId: string;
  entity: SupplementEntity;
  buttons?: React.ReactNode;
  onSuccess?: () => void;
};

const AttachmentCreateForm = ({
  entityId,
  entity,
  buttons,
  onSuccess,
}: AttachmentCreateFormProps) => {
  const [actionState, action] = useActionState(
    createAttachments.bind(null, { entityId, entity }),
    EMPTY_ACTION_STATE
  );

  return (
    <Form action={action} 
          actionState={actionState} 
          onSuccess={onSuccess}>
      <Input
        name="files"
        id="files"
        type="file"
        multiple
        accept={ACCEPTED.join(",")}
      />
      <FieldErrorMsg actionState={actionState} name="files" />

      {buttons || <SubmitButton label="Upload" />}
    </Form>
  );
};

export { AttachmentCreateForm };