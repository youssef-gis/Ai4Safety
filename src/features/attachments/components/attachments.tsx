import { AttachmentEntity } from "@prisma/client";
import {  CardElement } from "@/components/card-compact";
import { AttachmentCreateForm } from "./attachment-create-form";
import { getAttachments } from "../queries/get-attachments";
import { AttachmentList } from "./attachment-list";
import { AttachmentDeleteButton } from "./attachment-delete-button";

type AttachmentsProps = {
  entityId: string;
  entity: AttachmentEntity;
  isOwner: boolean;
};

const Attachments = async ({ entityId, entity, isOwner }: AttachmentsProps) => {
  const attachments = await getAttachments(entityId, entity);

  return (
    <CardElement
      title="Attachments"
      description="Attached images or PDFs"
      content={
        <>
          <AttachmentList
            attachments={attachments}
            buttons={(attachmentId: string) => [
              ...(isOwner
                ? [<AttachmentDeleteButton key="0" id={attachmentId} />]
                : []),
            ]}
          />

          {isOwner && (
            <AttachmentCreateForm entityId={entityId} entity={entity} />
          )}
        </>
      }
    />
  );
};

export { Attachments };